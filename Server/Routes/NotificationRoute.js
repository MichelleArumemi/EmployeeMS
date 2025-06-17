import express from "express";
import { getDB } from '../utils/db.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// GET /notifications - Fetch notifications for current user
router.get("/", async (req, res) => {
  try {
    // Get current user ID from the auth middleware
    const userId = req.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    const db = getDB();
    const notifications = await db.collection('notifications')
      .find({ recipientId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
// </edits>

// GET /notifications/:userId - Fetch notifications for a specific user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const db = getDB();
    const notifications = await db.collection('notifications')
      .find({ recipientId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /notifications - Create a new notification
router.post("/", async (req, res) => {
  const { 
    message, 
    recipient_id, 
    sender_id, 
    type = 'general',
    title,
    data 
  } = req.body;

  // Validate required fields
  if (!message) {
    return res.status(400).json({
      success: false,
      message: "Message is required",
    });
  }

  try {
    const db = getDB();
    const newNotification = {
      message,
      recipientId: new ObjectId(recipient_id),
      senderId: sender_id ? new ObjectId(sender_id) : new ObjectId(req.id),
      type,
      title,
      data: data || {},
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('notifications').insertOne(newNotification);

    res.status(201).json({ 
      success: true, 
      notification: { ...newNotification, _id: result.insertedId }
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// PUT /notifications/:notificationId/read - Mark notification as read
router.put("/:notificationId/read", async (req, res) => {
  const { notificationId } = req.params;

  try {
    const db = getDB();
    const result = await db.collection('notifications').updateOne(
      { _id: new ObjectId(notificationId) },
      { 
        $set: {
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Notification not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Notification marked as read"
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// PUT /notifications/mark-all-read/:userId - Mark all notifications as read for a user
router.put("/mark-all-read/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const db = getDB();
    const result = await db.collection('notifications').updateMany(
      { recipientId: new ObjectId(userId), isRead: false },
      { 
        $set: {
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    res.status(200).json({ 
      success: true, 
      message: `${result.modifiedCount} notifications marked as read`
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// DELETE /notifications/:notificationId - Delete a notification
router.delete("/:notificationId", async (req, res) => {
  const { notificationId } = req.params;

  try {
    const db = getDB();
    const result = await db.collection('notifications').deleteOne({ 
      _id: new ObjectId(notificationId) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Notification not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Notification deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET /notifications/unread/:userId - Get unread notification count for a user
router.get("/unread/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const db = getDB();
    const unreadCount = await db.collection('notifications').countDocuments({
      recipientId: new ObjectId(userId),
      isRead: false
    });

    res.status(200).json({ 
      success: true, 
      unreadCount 
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export { router as notificationRouter };