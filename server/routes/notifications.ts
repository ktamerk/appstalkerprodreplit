import express from 'express';
import { db } from '../db';
import { notifications, users, profiles } from '../../shared/schema';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { eq, and } from 'drizzle-orm';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const userNotifications = await db.select({
      id: notifications.id,
      type: notifications.type,
      content: notifications.content,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
      relatedUser: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      },
    })
      .from(notifications)
      .leftJoin(users, eq(notifications.relatedUserId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt)
      .limit(50);

    res.json({ notifications: userNotifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

router.put('/:notificationId/read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { notificationId } = req.params;

    const [updated] = await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      message: 'Notification marked as read',
      notification: updated,
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

router.put('/read-all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

export default router;
