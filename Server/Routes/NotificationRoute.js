import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../utils/db.js";

const router = express.Router();

// Middleware to verify admin role
const verifyAdmin = async (req, res, next) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Admin access required" 
      });
    }
    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET / - Get all notifications for current user
router.get("/", async (req, res) => {
  try {
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

// GET /unread-count - Get unread notification count for current user
router.get("/unread-count", async (req, res) => {
  try {
    const userId = req.id;
    const db = getDB();
    const count = await db.collection('notifications').countDocuments({
      recipientId: new ObjectId(userId),
      isRead: false
    });

    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST / - Create a new notification (admin to employee)
router.post("/", verifyAdmin, async (req, res) => {
  const { 
    message, 
    recipientId, 
    title = "System Notification",
    type = "admin",
    metadata = {}
  } = req.body;

  if (!message || !recipientId) {
    return res.status(400).json({
      success: false,
      message: "Message and recipient ID are required"
    });
  }

  try {
    const db = getDB();
    
    // Verify recipient exists
    const recipient = await db.collection("employees").findOne({
      _id: new ObjectId(recipientId)
    });

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "Recipient employee not found"
      });
    }

    const newNotification = {
      message,
      title,
      type,
      recipientId: new ObjectId(recipientId),
      senderId: new ObjectId(req.id), // Admin ID
      metadata,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('notifications').insertOne(newNotification);
    
    // Emit real-time notification
    req.io.to(`user_${recipientId}`).emit("new-notification", {
      ...newNotification,
      _id: result.insertedId
    });

    res.status(201).json({ 
      success: true, 
      notification: { ...newNotification, _id: result.insertedId }
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /bulk - Send notifications to multiple employees (admin only)
router.post("/bulk", verifyAdmin, async (req, res) => {
  const { 
    message, 
    recipientIds = [], 
    title = "System Notification",
    type = "admin",
    metadata = {}
  } = req.body;

  if (!message || recipientIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Message and at least one recipient ID are required"
    });
  }

  try {
    const db = getDB();
    const notifications = recipientIds.map(recipientId => ({
      message,
      title,
      type,
      recipientId: new ObjectId(recipientId),
      senderId: new ObjectId(req.id),
      metadata,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const result = await db.collection('notifications').insertMany(notifications);
    
    // Emit real-time notifications
    recipientIds.forEach(recipientId => {
      const notification = notifications.find(n => n.recipientId.toString() === recipientId);
      if (notification) {
        req.io.to(`user_${recipientId}`).emit("new-notification", {
          ...notification,
          _id: result.insertedIds[recipientIds.indexOf(recipientId)]
        });
      }
    });

    res.status(201).json({ 
      success: true, 
      count: result.insertedCount
    });
  } catch (error) {
    console.error("Error creating bulk notifications:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// PATCH /:id/read - Mark notification as read
router.patch("/:id/read", async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.id;
    const db = getDB();

    const result = await db.collection('notifications').updateOne(
      { 
        _id: new ObjectId(notificationId),
        recipientId: new ObjectId(userId) 
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Notification not found or not owned by user" 
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// PATCH /mark-all-read - Mark all notifications as read for current user
router.patch("/mark-all-read", async (req, res) => {
  try {
    const userId = req.id;
    const db = getDB();

    const result = await db.collection('notifications').updateMany(
      { 
        recipientId: new ObjectId(userId),
        isRead: false 
      },
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
      updatedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// DELETE /:id - Delete a notification (admin or owner)
router.delete("/:id", async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.id;
    const isAdmin = req.role === 'admin';
    const db = getDB();

    const query = isAdmin 
      ? { _id: new ObjectId(notificationId) }
      : { 
          _id: new ObjectId(notificationId),
          $or: [
            { recipientId: new ObjectId(userId) },
            { senderId: new ObjectId(userId) }
          ]
        };

    const result = await db.collection('notifications').deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Notification not found or not authorized" 
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export { router as notificationRouter };