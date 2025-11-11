import express from 'express';
import { db } from '../db';
import { follows, friendRequests, likes, notifications, users, profiles } from '../../shared/schema';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { eq, and, or } from 'drizzle-orm';
import { broadcastToUser } from '../websocket';

const router = express.Router();

router.post('/follow/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const followerId = req.userId!;
    const { userId: followingId } = req.params;

    if (followerId === followingId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const [existing] = await db.select().from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .limit(1);

    if (existing) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    const [follow] = await db.insert(follows).values({
      followerId,
      followingId,
    }).returning();

    const [notification] = await db.insert(notifications).values({
      userId: followingId,
      type: 'new_follower',
      content: 'started following you',
      relatedUserId: followerId,
    }).returning();

    broadcastToUser(followingId, {
      type: 'notification',
      data: notification,
    });

    res.json({
      message: 'Followed successfully',
      follow,
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

router.delete('/follow/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const followerId = req.userId!;
    const { userId: followingId } = req.params;

    await db.delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

router.get('/followers', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const followers = await db.select({
      id: users.id,
      username: users.username,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      followedAt: follows.createdAt,
    })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .innerJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(follows.followingId, userId));

    res.json({ followers });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Failed to get followers' });
  }
});

router.get('/following', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const following = await db.select({
      id: users.id,
      username: users.username,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
      followedAt: follows.createdAt,
    })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .innerJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(follows.followerId, userId));

    res.json({ following });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to get following' });
  }
});

router.post('/friend-request/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const senderId = req.userId!;
    const { userId: receiverId } = req.params;

    if (senderId === receiverId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    const [existing] = await db.select().from(friendRequests)
      .where(or(
        and(eq(friendRequests.senderId, senderId), eq(friendRequests.receiverId, receiverId)),
        and(eq(friendRequests.senderId, receiverId), eq(friendRequests.receiverId, senderId))
      ))
      .limit(1);

    if (existing) {
      return res.status(400).json({ error: 'Friend request already exists' });
    }

    const [request] = await db.insert(friendRequests).values({
      senderId,
      receiverId,
      status: 'pending',
    }).returning();

    const [notification] = await db.insert(notifications).values({
      userId: receiverId,
      type: 'friend_request',
      content: 'sent you a friend request',
      relatedUserId: senderId,
    }).returning();

    broadcastToUser(receiverId, {
      type: 'notification',
      data: notification,
    });

    res.json({
      message: 'Friend request sent',
      request,
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

router.put('/friend-request/:requestId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { requestId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [request] = await db.select().from(friendRequests)
      .where(eq(friendRequests.id, requestId))
      .limit(1);

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (request.receiverId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const [updatedRequest] = await db.update(friendRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(friendRequests.id, requestId))
      .returning();

    if (status === 'accepted') {
      await db.insert(follows).values([
        { followerId: request.senderId, followingId: request.receiverId },
        { followerId: request.receiverId, followingId: request.senderId },
      ]);

      const [notification] = await db.insert(notifications).values({
        userId: request.senderId,
        type: 'friend_request_accepted',
        content: 'accepted your friend request',
        relatedUserId: userId,
      }).returning();

      broadcastToUser(request.senderId, {
        type: 'notification',
        data: notification,
      });
    }

    res.json({
      message: `Friend request ${status}`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Update friend request error:', error);
    res.status(500).json({ error: 'Failed to update friend request' });
  }
});

router.get('/friend-requests', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const requests = await db.select({
      id: friendRequests.id,
      status: friendRequests.status,
      createdAt: friendRequests.createdAt,
      sender: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      },
    })
      .from(friendRequests)
      .innerJoin(users, eq(friendRequests.senderId, users.id))
      .innerJoin(profiles, eq(users.id, profiles.userId))
      .where(and(eq(friendRequests.receiverId, userId), eq(friendRequests.status, 'pending')));

    res.json({ requests });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Failed to get friend requests' });
  }
});

router.post('/like/:profileId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { profileId } = req.params;

    const [existing] = await db.select().from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.profileId, profileId)))
      .limit(1);

    if (existing) {
      return res.status(400).json({ error: 'Already liked this profile' });
    }

    const [like] = await db.insert(likes).values({
      userId,
      profileId,
    }).returning();

    const [profile] = await db.select().from(profiles).where(eq(profiles.id, profileId)).limit(1);

    if (profile) {
      const [notification] = await db.insert(notifications).values({
        userId: profile.userId,
        type: 'profile_like',
        content: 'liked your profile',
        relatedUserId: userId,
      }).returning();

      broadcastToUser(profile.userId, {
        type: 'notification',
        data: notification,
      });
    }

    res.json({
      message: 'Profile liked',
      like,
    });
  } catch (error) {
    console.error('Like profile error:', error);
    res.status(500).json({ error: 'Failed to like profile' });
  }
});

router.delete('/like/:profileId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { profileId } = req.params;

    await db.delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.profileId, profileId)));

    res.json({ message: 'Like removed' });
  } catch (error) {
    console.error('Unlike profile error:', error);
    res.status(500).json({ error: 'Failed to unlike profile' });
  }
});

export default router;
