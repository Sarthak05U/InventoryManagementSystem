const express = require('express');
const router = express.Router();
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getStockAlerts,
  getCategories,
} = require('../controllers/itemController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         sku:
 *           type: string
 *         category:
 *           type: string
 *         quantity:
 *           type: number
 *         unitPrice:
 *           type: number
 *         supplier:
 *           type: string
 *         createdBy:
 *           type: string
 */

/**
 * @swagger
 * /api/items/alerts:
 *   get:
 *     summary: Get items with low stock (quantity < 10)
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of low-stock items
 */
router.get('/alerts', protect, getStockAlerts);

/**
 * @swagger
 * /api/items/categories:
 *   get:
 *     summary: Get all item categories
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of unique categories
 */
router.get('/categories', protect, getCategories);

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items with search and filter
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or SKU
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Paginated list of items
 */
router.get('/', protect, getItems);

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get a single item by ID
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item details
 *       404:
 *         description: Item not found
 */
router.get('/:id', protect, getItem);

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create a new item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, sku, category, quantity, unitPrice, supplier]
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               category:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unitPrice:
 *                 type: number
 *               supplier:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item created
 */
router.post('/', protect, authorize('Admin', 'Manager'), createItem);

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Update an item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               category:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unitPrice:
 *                 type: number
 *               supplier:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item updated
 *       404:
 *         description: Item not found
 */
router.put('/:id', protect, authorize('Admin', 'Manager'), updateItem);

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Delete an item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed
 *       404:
 *         description: Item not found
 */
router.delete('/:id', protect, authorize('Admin'), deleteItem);

module.exports = router;
