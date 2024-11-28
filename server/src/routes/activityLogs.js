const express = require('express');
const { auth, isAdmin } = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');
const router = express.Router();

// Get all activity logs (admin only)
router.get('/', [auth, isAdmin], async (req, res) => {
  try {
    const { page = 1, limit = 20, action, entityType, userId } = req.query;
    const query = {};

    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (userId) query.user = userId;

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('user', 'username email'),
      ActivityLog.countDocuments(query)
    ]);

    res.json({
      logs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity logs' });
  }
});

// Get user's own activity logs
router.get('/my-activities', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      ActivityLog.countDocuments(query)
    ]);

    res.json({
      logs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity logs' });
  }
});

module.exports = router; 