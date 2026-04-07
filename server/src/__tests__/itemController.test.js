const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const User = require('../models/User');
const Item = require('../models/Item');
const ActivityLog = require('../models/ActivityLog');
const generateToken = require('../utils/generateToken');

let mongoServer;
let adminToken;
let adminUser;
let staffToken;
let staffUser;
let app;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-key-for-jest';
  process.env.NODE_ENV = 'test';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  app = require('../index');

  adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'Admin',
    approved: true,
  });
  adminToken = generateToken(adminUser._id);

  staffUser = await User.create({
    name: 'Staff User',
    email: 'staff@test.com',
    password: 'password123',
    role: 'Staff',
    approved: true,
  });
  staffToken = generateToken(staffUser._id);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await Item.deleteMany({});
  await ActivityLog.deleteMany({});
});

describe('Item Controller', () => {
  const sampleItem = {
    name: 'Widget A',
    sku: 'WDG-001',
    category: 'Electronics',
    quantity: 50,
    unitPrice: 29.99,
    supplier: 'Acme Corp',
  };

  describe('POST /api/items', () => {
    it('should create a new item (Admin)', async () => {
      const res = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleItem);

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe(sampleItem.name);
      expect(res.body.sku).toBe(sampleItem.sku.toUpperCase());
      expect(res.body.quantity).toBe(sampleItem.quantity);
    });

    it('should reject duplicate SKU', async () => {
      await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleItem);

      const res = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleItem);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should deny Staff from creating items', async () => {
      const res = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(sampleItem);

      expect(res.statusCode).toBe(403);
    });

    it('should reject unauthenticated requests', async () => {
      const res = await request(app).post('/api/items').send(sampleItem);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/items', () => {
    beforeEach(async () => {
      await Item.create([
        { ...sampleItem, createdBy: adminUser._id },
        {
          name: 'Gadget B',
          sku: 'GDG-002',
          category: 'Tools',
          quantity: 5,
          unitPrice: 15.0,
          supplier: 'ToolCo',
          createdBy: adminUser._id,
        },
        {
          name: 'Thingamajig',
          sku: 'THG-003',
          category: 'Electronics',
          quantity: 100,
          unitPrice: 9.99,
          supplier: 'Acme Corp',
          createdBy: adminUser._id,
        },
      ]);
    });

    it('should return all items', async () => {
      const res = await request(app)
        .get('/api/items')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.items).toHaveLength(3);
      expect(res.body.total).toBe(3);
    });

    it('should search items by name', async () => {
      const res = await request(app)
        .get('/api/items?search=Widget')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].name).toBe('Widget A');
    });

    it('should search items by SKU', async () => {
      const res = await request(app)
        .get('/api/items?search=GDG')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].sku).toBe('GDG-002');
    });

    it('should filter items by category', async () => {
      const res = await request(app)
        .get('/api/items?category=Electronics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.items).toHaveLength(2);
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return a single item', async () => {
      const item = await Item.create({
        ...sampleItem,
        createdBy: adminUser._id,
      });

      const res = await request(app)
        .get(`/api/items/${item._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe(sampleItem.name);
    });

    it('should return 404 for non-existent item', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/items/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update an item', async () => {
      const item = await Item.create({
        ...sampleItem,
        createdBy: adminUser._id,
      });

      const res = await request(app)
        .put(`/api/items/${item._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 75 });

      expect(res.statusCode).toBe(200);
      expect(res.body.quantity).toBe(75);
    });

    it('should return 404 for non-existent item', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/items/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 75 });

      expect(res.statusCode).toBe(404);
    });

    it('should create an activity log on update', async () => {
      const item = await Item.create({
        ...sampleItem,
        createdBy: adminUser._id,
      });

      await request(app)
        .put(`/api/items/${item._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 75 });

      const logs = await ActivityLog.find({ action: 'UPDATE' });
      expect(logs).toHaveLength(1);
      expect(logs[0].itemName).toBe(sampleItem.name);
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an item (Admin only)', async () => {
      const item = await Item.create({
        ...sampleItem,
        createdBy: adminUser._id,
      });

      const res = await request(app)
        .delete(`/api/items/${item._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Item removed');

      const found = await Item.findById(item._id);
      expect(found).toBeNull();
    });

    it('should return 404 for non-existent item', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/items/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });

    it('should create an activity log on delete', async () => {
      const item = await Item.create({
        ...sampleItem,
        createdBy: adminUser._id,
      });

      await request(app)
        .delete(`/api/items/${item._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const logs = await ActivityLog.find({ action: 'DELETE' });
      expect(logs).toHaveLength(1);
    });
  });

  describe('GET /api/items/alerts', () => {
    it('should return items with quantity < 10', async () => {
      await Item.create([
        { ...sampleItem, quantity: 50, createdBy: adminUser._id },
        {
          name: 'Low Stock Item',
          sku: 'LOW-001',
          category: 'Electronics',
          quantity: 3,
          unitPrice: 10,
          supplier: 'Test',
          createdBy: adminUser._id,
        },
        {
          name: 'Critical Item',
          sku: 'CRT-001',
          category: 'Tools',
          quantity: 0,
          unitPrice: 5,
          supplier: 'Test',
          createdBy: adminUser._id,
        },
      ]);

      const res = await request(app)
        .get('/api/items/alerts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].quantity).toBeLessThan(10);
    });
  });

  describe('GET /api/items/categories', () => {
    it('should return unique categories', async () => {
      await Item.create([
        { ...sampleItem, createdBy: adminUser._id },
        {
          name: 'Tool',
          sku: 'TL-001',
          category: 'Tools',
          quantity: 10,
          unitPrice: 5,
          supplier: 'Test',
          createdBy: adminUser._id,
        },
      ]);

      const res = await request(app)
        .get('/api/items/categories')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toContain('Electronics');
      expect(res.body).toContain('Tools');
    });
  });
});
