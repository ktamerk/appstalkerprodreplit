import express from 'express';
import { db } from '../db';
import { installedApps, follows, notifications } from '../../shared/schema';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { eq, and, inArray } from 'drizzle-orm';
import { broadcastToUser } from '../websocket';

const router = express.Router();

router.post('/sync', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { apps } = req.body;

    if (!Array.isArray(apps)) {
      return res.status(400).json({ error: 'Apps must be an array' });
    }

    const existingApps = await db.select().from(installedApps).where(eq(installedApps.userId, userId));
    const existingPackageNames = new Set(existingApps.map(app => app.packageName));

    const newApps = apps.filter((app: any) => !existingPackageNames.has(app.packageName));

    if (newApps.length > 0) {
      const insertedApps = await db.insert(installedApps)
        .values(newApps.map((app: any) => ({
          userId,
          packageName: app.packageName,
          appName: app.appName,
          appIcon: app.appIcon || null,
          platform: app.platform,
          isVisible: false,
        })))
        .returning();

      // Don't notify followers yet - wait until user makes app visible
    }

    const currentPackageNames = new Set(apps.map((app: any) => app.packageName));
    const removedApps = existingApps.filter(app => !currentPackageNames.has(app.packageName));

    if (removedApps.length > 0) {
      await db.delete(installedApps)
        .where(and(
          eq(installedApps.userId, userId),
          inArray(installedApps.packageName, removedApps.map(app => app.packageName))
        ));
    }

    const updatedApps = await db.select().from(installedApps).where(eq(installedApps.userId, userId));

    res.json({
      message: 'Apps synced successfully',
      apps: updatedApps,
      newApps: newApps.map((app: any) => ({
        packageName: app.packageName,
        appName: app.appName,
        appIcon: app.appIcon,
        platform: app.platform,
      })),
      newAppsCount: newApps.length,
      removedAppsCount: removedApps.length,
    });
  } catch (error) {
    console.error('Sync apps error:', error);
    res.status(500).json({ error: 'Failed to sync apps' });
  }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const apps = await db.select().from(installedApps)
      .where(eq(installedApps.userId, userId))
      .orderBy(installedApps.installedAt);

    res.json({ apps });
  } catch (error) {
    console.error('Get apps error:', error);
    res.status(500).json({ error: 'Failed to get apps' });
  }
});

router.put('/:appId/visibility', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { appId } = req.params;
    const { isVisible } = req.body;

    const [updatedApp] = await db.update(installedApps)
      .set({ isVisible })
      .where(and(eq(installedApps.id, appId), eq(installedApps.userId, userId)))
      .returning();

    if (!updatedApp) {
      return res.status(404).json({ error: 'App not found' });
    }

    // If app becomes visible, notify followers
    if (isVisible && !updatedApp.isVisible) {
      const followers = await db.select().from(follows).where(eq(follows.followingId, userId));
      
      for (const follower of followers) {
        const [notification] = await db.insert(notifications).values({
          userId: follower.followerId,
          type: 'new_app',
          content: `installed ${updatedApp.appName}`,
          relatedUserId: userId,
          relatedAppId: updatedApp.id,
        }).returning();

        broadcastToUser(follower.followerId, {
          type: 'notification',
          data: notification,
        });
      }
    }

    res.json({
      message: 'App visibility updated',
      app: updatedApp,
    });
  } catch (error) {
    console.error('Update app visibility error:', error);
    res.status(500).json({ error: 'Failed to update app visibility' });
  }
});

router.post('/visibility/bulk', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Updates must be a non-empty array' });
    }

    const updatedApps = [];
    const nowVisibleApps = [];

    for (const update of updates) {
      const { packageName, isVisible } = update;
      
      if (!packageName || typeof isVisible !== 'boolean') {
        continue;
      }

      const [app] = await db.select()
        .from(installedApps)
        .where(and(
          eq(installedApps.userId, userId),
          eq(installedApps.packageName, packageName)
        ));

      if (app) {
        const [updatedApp] = await db.update(installedApps)
          .set({ isVisible })
          .where(and(
            eq(installedApps.userId, userId),
            eq(installedApps.packageName, packageName)
          ))
          .returning();

        updatedApps.push(updatedApp);

        // Track newly visible apps for notifications
        if (isVisible && !app.isVisible) {
          nowVisibleApps.push(updatedApp);
        }
      }
    }

    // Notify followers about newly visible apps
    if (nowVisibleApps.length > 0) {
      const followers = await db.select().from(follows).where(eq(follows.followingId, userId));
      
      for (const app of nowVisibleApps) {
        for (const follower of followers) {
          const [notification] = await db.insert(notifications).values({
            userId: follower.followerId,
            type: 'new_app',
            content: `installed ${app.appName}`,
            relatedUserId: userId,
            relatedAppId: app.id,
          }).returning();

          broadcastToUser(follower.followerId, {
            type: 'notification',
            data: notification,
          });
        }
      }
    }

    res.json({
      message: 'Apps visibility updated',
      updatedCount: updatedApps.length,
      apps: updatedApps,
    });
  } catch (error) {
    console.error('Bulk update app visibility error:', error);
    res.status(500).json({ error: 'Failed to update apps visibility' });
  }
});

export default router;
