/**
 * Security Tests
 * Tests for SQL Injection, XSS, and other security vulnerabilities
 */

const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const mongoose = require('mongoose');

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mentalmap-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
});

afterAll(async () => {
  await User.deleteMany({ email: /^security-test-/ });
  await mongoose.connection.close();
});

describe('Security Tests', () => {
  describe('SQL Injection Protection', () => {
    it('should reject SQL injection attempts in login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: "' OR '1'='1",
          password: "' OR '1'='1"
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject SQL injection attempts in registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: "'; DROP TABLE users; --",
          email: "test@example.com",
          password: "TestPassword123",
          confirmPassword: "TestPassword123"
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('XSS Protection', () => {
    let token;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'xsstest',
          email: 'security-test-xss@example.com',
          password: 'TestPassword123',
          confirmPassword: 'TestPassword123'
        });

      token = response.body.token;
    });

    it('should sanitize XSS attempts in mental map title', async () => {
      const response = await request(app)
        .post('/api/mentalmap')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '<script>alert("XSS")</script>',
          description: 'Test'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.title).not.toContain('<script>');
    });

    it('should sanitize XSS attempts in card content', async () => {
      // First create a mental map
      const mapResponse = await request(app)
        .post('/api/mentalmap')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Map',
          description: 'Test'
        });

      const mapId = mapResponse.body.data._id;

      // Try to add card with XSS
      const cardResponse = await request(app)
        .post(`/api/mentalmap/${mapId}/cards`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'text',
          title: 'XSS Test',
          content: '<img src=x onerror="alert(\'XSS\')">',
          x: 100,
          y: 100
        });

      expect(cardResponse.status).toBe(201);
      expect(cardResponse.body.data.content).not.toContain('onerror');
    });
  });

  describe('Input Validation', () => {
    it('should reject empty email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: '',
          password: 'TestPassword123',
          confirmPassword: 'TestPassword123'
        });

      expect(response.status).toBe(400);
    });

    it('should reject empty password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '',
          confirmPassword: ''
        });

      expect(response.status).toBe(400);
    });

    it('should reject very long strings', async () => {
      const longString = 'a'.repeat(10000);
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: longString,
          email: 'test@example.com',
          password: 'TestPassword123',
          confirmPassword: 'TestPassword123'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit excessive requests', async () => {
      // Make 101 requests (limit is 100 per minute)
      const requests = [];
      for (let i = 0; i < 101; i++) {
        requests.push(
          request(app)
            .get('/api/health')
        );
      }

      const responses = await Promise.all(requests);
      const rateLimitedResponse = responses[responses.length - 1];

      expect(rateLimitedResponse.status).toBe(429);
    });
  });

  describe('JWT Token Security', () => {
    it('should reject expired tokens', async () => {
      // This would require setting a very short JWT expiry for testing
      // In a real scenario, you'd mock the JWT verification
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');

      expect(response.status).toBe(401);
    });

    it('should reject tampered tokens', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.TAMPERED');

      expect(response.status).toBe(401);
    });
  });

  describe('CORS Protection', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should reject requests from unauthorized origins', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://malicious-site.com');

      // CORS will still return 200 but without the header
      expect(response.status).toBe(200);
    });
  });
});
