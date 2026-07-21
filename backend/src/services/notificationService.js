const Notification = require('../models/Notification');

const createNotification = async ({
  userId,
  message,
  type = 'system',
  relatedAccountId = null,
  metadata = {},
}) => {
  try {
    const notification = await Notification.create({
      userId,
      message,
      type,
      relatedAccountId,
      metadata,
    });

    return notification;
  } catch (error) {
    console.error('[NotificationService] Error:', error);
    throw error;
  }
};


const createBulkNotifications = async (notifications) => {
  try {
    return await Notification.insertMany(notifications);
  } catch (error) {
    console.error('[NotificationService] Bulk error:', error);
    throw error;
  }
};


module.exports = {
  createNotification,
  createBulkNotifications,
};


