import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipients: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedEntity: {
    type: String,
    enum: ['leave', 'announcement', 'other'],
    default: 'announcement'
  },
  relatedEntityId: {
    type: Schema.Types.ObjectId
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
notificationSchema.index({ recipients: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

// Static methods
notificationSchema.statics.getUserNotifications = function(userId) {
  return this.find({ recipients: userId })
    .sort({ createdAt: -1 })
    .populate('sender', 'name email');
};

notificationSchema.statics.markAsRead = function(notificationId, userId) {
  return this.updateOne(
    { _id: notificationId, recipients: userId },
    { $set: { isRead: true } }
  );
};

const Notification = model('Notification', notificationSchema);

export default Notification;