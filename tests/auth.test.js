/**
 * Authentication Tests
 * Unit tests for authentication endpoints
 */

const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const mongoose = require('mongoose');

// Mock database connection
beforeAll(async () => {
  // Connect to test database
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mentalmap-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
});

afterAll(async () => {
  // Clean up test data
  await User.deleteMany({ email: /^test-/ });
  await mongoose.connection.close();
});

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test-user@example.com',
          password: 'TestPassword123',
          confirmPassword: 'TestPassword123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test-user@example.com');
    });

    it('should reject weak passwords', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'test-user2@example.com',
          password: 'weak',
          confirmPassword: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject mismatched passwords', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser3',
          email: 'test-user3@example.com',
          password: 'TestPassword123',
          confirmPassword: 'DifferentPassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser4',
          email: 'invalid-email',
          password: 'TestPassword123',
          confirmPassword: 'TestPassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser5',
          email: 'test-duplicate@example.com',
          password: 'TestPassword123',
          confirmPassword: 'TestPassword123'
        });

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser6',
          email: 'test-duplicate@example.com',
          password: 'TestPassword123',
          confirmPassword: 'TestPassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'logintest',
          email: 'test-login@example.com',
          password: 'TestPassword123',
          confirmPassword: 'TestPassword123'
        });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-login@example.com',
          password: 'TestPassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-login@example.com',
          password: 'WrongPassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'metest',
          email: 'test-me@example.com',
          password: 'TestPassword123',
          confirmPassword: 'TestPassword123'
        });

      token = response.body.token;
    });

    it('should return user data with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test-me@example.com');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
