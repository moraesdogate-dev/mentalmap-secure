/**
 * Site Preview Tests
 * Unit tests for site preview endpoint
 */

const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const mongoose = require('mongoose');

let token;

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
      username: 'previewtest',
      email: 'test-preview@example.com',
      password: 'TestPassword123',
      confirmPassword: 'TestPassword123'
    });

  token = registerRes.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: /^test-preview/ });
  await mongoose.connection.close();
});

describe('Site Preview Endpoint', () => {
  describe('GET /api/preview', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/preview')
        .query({ url: 'https://example.com' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should require URL parameter', async () => {
      const response = await request(app)
        .get('/api/preview')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });

    it('should reject invalid URL', async () => {
      const response = await request(app)
        .get('/api/preview')
        .set('Authorization', `Bearer ${token}`)
        .query({ url: 'not-a-url' });

      expect(response.status).toBe(400);
    });

    it('should reject URL without protocol', async () => {
      const response = await request(app)
        .get('/api/preview')
        .set('Authorization', `Bearer ${token}`)
        .query({ url: 'example.com' });

      expect(response.status).toBe(400);
    });

    it('should handle valid URLs', async () => {
      // Note: This test may fail if the URL is not accessible
      // In production, you might want to mock this
      const response = await request(app)
        .get('/api/preview')
        .set('Authorization', `Bearer ${token}`)
        .query({ url: 'https://example.com' });

      // Should either succeed or fail gracefully
      expect([200, 400]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.url).toBe('https://example.com');
        expect(response.body.data.title).toBeDefined();
        expect(response.body.data.domain).toBeDefined();
      }
    });

    it('should handle unreachable URLs gracefully', async () => {
      const response = await request(app)
        .get('/api/preview')
        .set('Authorization', `Bearer ${token}`)
        .query({ url: 'https://this-domain-definitely-does-not-exist-12345.com' });

      // Should fail gracefully, not crash
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
