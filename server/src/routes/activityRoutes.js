const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     ActivityLog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         action:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE]
 *         itemId:
 *           type: string
 *         itemName:
 *           type: string
 *         userId:
 *           type: string
 *         details:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/activity:
 *   get:
 *     summary: Get activity logs
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated list of activity logs
 */
router.get('/', protect, getActivityLogs);

module.exports = router;
