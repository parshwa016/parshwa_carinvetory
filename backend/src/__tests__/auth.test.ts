import request from 'supertest';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import app from '../app';
import prisma from '../db';

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    // Clear user table before each test
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          role: 'USER',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.role).toBe('USER');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should fail if email is already registered', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          role: 'USER',
        });

      // Try registering duplicate
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          role: 'USER',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'only-email@example.com',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user to log in with
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'login@example.com',
          password: 'secretpassword',
          role: 'USER',
        });
    });

    it('should log in successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'secretpassword',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('login@example.com');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should fail to log in with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail to log in with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nobody@example.com',
          password: 'secretpassword',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/google', () => {
    it('should register and log in a new Google user', async () => {
      const res = await request(app)
        .post('/api/auth/google')
        .send({
          email: 'google-new@example.com',
          role: 'USER',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('google-new@example.com');
      expect(res.body.user.role).toBe('USER');
    });

    it('should log in an existing user via Google', async () => {
      // Create user first
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'google-existing@example.com',
          password: 'somepassword',
          role: 'ADMIN',
        });

      // Login via Google
      const res = await request(app)
        .post('/api/auth/google')
        .send({
          email: 'google-existing@example.com',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('google-existing@example.com');
      expect(res.body.user.role).toBe('ADMIN'); // Keeps their previous role if not overridden
    });

    it('should update user role if explicitly passed in google login', async () => {
      // Create user first
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'google-update@example.com',
          password: 'somepassword',
          role: 'USER',
        });

      // Login via Google and escalate to ADMIN
      const res = await request(app)
        .post('/api/auth/google')
        .send({
          email: 'google-update@example.com',
          role: 'ADMIN',
        });

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('ADMIN');
    });

    it('should fail with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/google')
        .send({});

      expect(res.status).toBe(400);
    });
  });
});
