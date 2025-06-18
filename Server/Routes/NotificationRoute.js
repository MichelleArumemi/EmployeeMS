import express from 'express';
import { getDB } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import { verifyAdmin, verifyUser } from '../middleware/auth.js';

const router = express.Router();

// Admin creates notification
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { title, message, recipientIds } = req.body;
    const senderId = req.id;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    const newNotification = {
      senderId: new ObjectId(senderId),
      recipientIds: recipientIds.map(id => new ObjectId(id)),
      title,
      message,
      isRead: false,
      createdAt: new Date()
    };

    const result = await db.collection('notifications').insertOne(newNotification);

    // Send real-time notification
    if (req.io) {
      recipientIds.forEach(recipientId => {
        req.io.to(`user_${recipientId}`).emit('new_notification', {
          notificationId: result.insertedId,
          title,
          message,
          createdAt: newNotification.createdAt
        });
      });
    }

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: {
        notificationId: result.insertedId,
        ...newNotification
      }
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification'
    });
  }
});

// User gets their notifications
router.get('/mynotifications', verifyUser, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.id;

    const notifications = await db.collection('notifications')
      .find({ recipientIds: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    // Get sender details for each notification
    const notificationsWithSenders = await Promise.all(
      notifications.map(async notification => {
        const sender = await db.collection('users').findOne(
          { _id: notification.senderId },
          { projection: { name: 1, email: 1, avatar: 1 } }
        );
        return {
          ...notification,
          sender
        };
      })
    );

    res.status(200).json({
      success: true,
      data: notificationsWithSenders
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// User marks notification as read
router.patch('/:id/read', verifyUser, async (req, res) => {
  try {
    const db = getDB();
    const notificationId = req.params.id;
    const userId = req.id;

    const result = await db.collection('notifications').updateOne(
      { _id: new ObjectId(notificationId), recipientIds: new ObjectId(userId) },
      { $set: { isRead: true } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or already read'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

export { router as notificationRouter };