import express from 'express';
import { db } from '../db';
import { users, profiles, installedApps, follows, likes } from '../../shared/schema';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { eq, and, sql } from 'drizzle-orm';

const router = express.Router();

router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

    if (!user || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const followersCount = await db.select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followingId, userId));

    const followingCount = await db.select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followerId, userId));

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      profile: {
        ...profile,
        followersCount: Number(followersCount[0].count),
        followingCount: Number(followingCount[0].count),
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

router.get('/:username', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.userId!;

    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const [isFollowing] = await db.select()
      .from(follows)
      .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, user.id)))
      .limit(1);

    if (profile.isPrivate && currentUserId !== user.id && !isFollowing) {
      return res.status(403).json({ error: 'This profile is private' });
    }

    const followersCount = await db.select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followingId, user.id));

    const followingCount = await db.select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followerId, user.id));

    const apps = profile.showApps ? await db.select().from(installedApps)
      .where(and(eq(installedApps.userId, user.id), eq(installedApps.isVisible, true)))
      .orderBy(installedApps.installedAt) : [];

    res.json({
      user: {
        id: user.id,
        username: user.username,
      },
      profile: {
        ...profile,
        followersCount: Number(followersCount[0].count),
        followingCount: Number(followingCount[0].count),
        isFollowing: !!isFollowing,
      },
      apps: apps,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

router.put('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { displayName, bio, avatarUrl, showApps, isPrivate } = req.body;

    const [updatedProfile] = await db.update(profiles)
      .set({
        displayName: displayName || undefined,
        bio: bio !== undefined ? bio : undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
        showApps: showApps !== undefined ? showApps : undefined,
        isPrivate: isPrivate !== undefined ? isPrivate : undefined,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, userId))
      .returning();

    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.get('/search/:query', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { query } = req.params;
    
    const searchResults = await db.select({
      id: users.id,
      username: users.username,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      bio: profiles.bio,
    })
      .from(users)
      .innerJoin(profiles, eq(users.id, profiles.userId))
      .where(sql`${users.username} ILIKE ${`%${query}%`} OR ${profiles.displayName} ILIKE ${`%${query}%`}`)
      .limit(20);

    res.json({ users: searchResults });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
