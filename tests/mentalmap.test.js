/**
 * Mental Map Tests
 * Unit tests for mental map endpoints
 */

const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const MentalMap = require('../models/MentalMap');
const mongoose = require('mongoose');

let token;
let userId;
let mapId;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mentalmap-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }

  // Create test user
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({
      username: 'maptest',
      email: 'test-map@example.com',
      password: 'TestPassword123',
      confirmPassword: 'TestPassword123'
    });

  token = registerRes.body.token;
  userId = registerRes.body.user._id;
});

afterAll(async () => {
  await User.deleteMany({ email: /^test-map/ });
  await MentalMap.deleteMany({ userId });
  await mongoose.connection.close();
});

describe('Mental Map Endpoints', () => {
  describe('POST /api/mentalmap', () => {
    it('should create a new mental map', async () => {
      const response = await request(app)
        .post('/api/mentalmap')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Map',
          description: 'A test mental map'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.mentalMap).toBeDefined();
      expect(response.body.mentalMap.name).toBe('Test Map');
      expect(response.body.mentalMap.userId).toBe(userId);

      mapId = response.body.mentalMap._id;
    });

    it('should reject map without name', async () => {
      const response = await request(app)
        .post('/api/mentalmap')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'No name'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject map with very long name', async () => {
      const response = await request(app)
        .post('/api/mentalmap')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'a'.repeat(101),
          description: 'Test'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/mentalmap')
        .send({
          name: 'Test Map',
          description: 'Test'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/mentalmap', () => {
    it('should list user mental maps', async () => {
      const response = await request(app)
        .get('/api/mentalmap')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.mentalMaps)).toBe(true);
      expect(response.body.mentalMaps.length).toBeGreaterThan(0);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/mentalmap');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/mentalmap/:id', () => {
    it('should get a specific mental map', async () => {
      const response = await request(app)
        .get(`/api/mentalmap/${mapId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.mentalMap).toBeDefined();
      expect(response.body.mentalMap._id).toBe(mapId);
    });

    it('should return 404 for non-existent map', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/mentalmap/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/mentalmap/${mapId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/mentalmap/:id', () => {
    it('should update a mental map', async () => {
      const response = await request(app)
        .put(`/api/mentalmap/${mapId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Map',
          description: 'Updated description'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.mentalMap.name).toBe('Updated Map');
    });

    it('should not allow updating other users maps', async () => {
      // Create another user
      const otherUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'otheruser',
          email: 'other-user@example.com',
          password: 'TestPassword123',
          confirmPassword: 'TestPassword123'
        });

      const otherToken = otherUserRes.body.token;

      const response = await request(app)
        .put(`/api/mentalmap/${mapId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          name: 'Hacked Map'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/mentalmap/:id/cards', () => {
    it('should add a card to mental map', async () => {
      const response = await request(app)
        .post(`/api/mentalmap/${mapId}/cards`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'text',
          title: 'Test Card',
          content: 'Test content',
          x: 100,
          y: 100
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.card).toBeDefined();
      expect(response.body.card.type).toBe('text');
      expect(response.body.card.title).toBe('Test Card');
    });

    it('should add link card with preview', async () => {
      const response = await request(app)
        .post(`/api/mentalmap/${mapId}/cards`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'link',
          title: 'Example Link',
          url: 'https://example.com',
          description: 'Example website',
          imageSrc: 'https://example.com/image.jpg',
          x: 200,
          y: 200
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.card.type).toBe('link');
      expect(response.body.card.url).toBe('https://example.com');
    });

    it('should reject card without required fields', async () => {
      const response = await request(app)
        .post(`/api/mentalmap/${mapId}/cards`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'text',
          title: 'No coordinates'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid card type', async () => {
      const response = await request(app)
        .post(`/api/mentalmap/${mapId}/cards`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'invalid',
          title: 'Invalid Type',
          x: 100,
          y: 100
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/mentalmap/:id', () => {
    let mapToDelete;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/mentalmap')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Map to Delete',
          description: 'Will be deleted'
        });

      mapToDelete = createRes.body.mentalMap._id;
    });

    it('should delete a mental map', async () => {
      const response = await request(app)
        .delete(`/api/mentalmap/${mapToDelete}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify it's deleted
      const getRes = await request(app)
        .get(`/api/mentalmap/${mapToDelete}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.status).toBe(404);
    });

    it('should not allow deleting other users maps', async () => {
      const otherUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'deletetest',
          email: 'delete-test@example.com',
          password: 'TestPassword123',
          confirmPassword: 'TestPassword123'
        });

      const otherToken = otherUserRes.body.token;

      const response = await request(app)
        .delete(`/api/mentalmap/${mapToDelete}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
