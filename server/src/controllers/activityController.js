const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity logs
// @route   GET /api/activity
const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const logs = await ActivityLog.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments();

    res.json({
      logs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getActivityLogs };
