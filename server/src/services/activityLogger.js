const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({
  user,
  action,
  entityType,
  entityId,
  details = {},
  req = null
}) => {
  try {
    const activityLog = new ActivityLog({
      user: user._id,
      action,
      entityType,
      entityId,
      details,
      ipAddress: req?.ip,
      userAgent: req?.headers['user-agent']
    });

    await activityLog.save();
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = {
  logActivity
}; 