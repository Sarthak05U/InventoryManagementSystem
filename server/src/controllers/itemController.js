const Item = require('../models/Item');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all items (with search & filter)
// @route   GET /api/items
const getItems = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    const items = await Item.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Item.countDocuments(query);

    res.json({
      items,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create item
// @route   POST /api/items
const createItem = async (req, res) => {
  try {
    const { name, sku, category, quantity, unitPrice, supplier } = req.body;

    const existingItem = await Item.findOne({ sku: sku.toUpperCase() });
    if (existingItem) {
      return res.status(400).json({ message: 'Item with this SKU already exists' });
    }

    const item = await Item.create({
      name,
      sku,
      category,
      quantity,
      unitPrice,
      supplier,
      createdBy: req.user._id,
    });

    await ActivityLog.create({
      action: 'CREATE',
      itemId: item._id,
      itemName: item.name,
      userId: req.user._id,
      details: `Created item "${item.name}" (SKU: ${item.sku})`,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const changes = [];
    const fields = ['name', 'sku', 'category', 'quantity', 'unitPrice', 'supplier'];
    for (const field of fields) {
      if (req.body[field] !== undefined && req.body[field] !== item[field]) {
        changes.push(`${field}: ${item[field]} → ${req.body[field]}`);
      }
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await ActivityLog.create({
      action: 'UPDATE',
      itemId: updatedItem._id,
      itemName: updatedItem.name,
      userId: req.user._id,
      details: changes.length > 0 ? changes.join(', ') : 'No field changes detected',
    });

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await ActivityLog.create({
      action: 'DELETE',
      itemId: item._id,
      itemName: item.name,
      userId: req.user._id,
      details: `Deleted item "${item.name}" (SKU: ${item.sku})`,
    });

    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get low-stock items (quantity < 10)
// @route   GET /api/items/alerts
const getStockAlerts = async (req, res) => {
  try {
    const items = await Item.find({ quantity: { $lt: 10 } })
      .populate('createdBy', 'name email')
      .sort({ quantity: 1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all categories
// @route   GET /api/items/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Item.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getStockAlerts,
  getCategories,
};
