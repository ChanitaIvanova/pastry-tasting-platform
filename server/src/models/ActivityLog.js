const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'CREATE_QUESTIONNAIRE',
      'UPDATE_QUESTIONNAIRE',
      'CLOSE_QUESTIONNAIRE',
      'DELETE_QUESTIONNAIRE',
      'SUBMIT_RESPONSE',
      'UPDATE_RESPONSE',
      'VIEW_STATISTICS'
    ]
  },
  entityType: {
    type: String,
    required: true,
    enum: ['USER', 'QUESTIONNAIRE', 'RESPONSE']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema); 