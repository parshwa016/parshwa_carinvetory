import request from 'supertest';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import app from '../app';
import prisma from '../db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-jwt-key-dealership';

describe('Vehicles Endpoints', () => {
  let userToken: string;
  let adminToken: string;
  let vehicleId: string;

  beforeEach(async () => {
    // Clear databases
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();

    // Create a regular user and an admin user
    const user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: 'password123',
        role: 'USER',
      },
    });

    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: 'password123',
        role: 'ADMIN',
      },
    });

    // Generate tokens
    userToken = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET);
    adminToken = jwt.sign({ userId: admin.id, email: admin.email, role: admin.role }, JWT_SECRET);

    // Create a sample vehicle for testing updates/details
    const vehicle = await prisma.vehicle.create({
      data: {
        make: 'Honda',
        model: 'Civic',
        category: 'Sedan',
        price: 25000,
        quantity: 5,
      },
    });
    vehicleId = vehicle.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/vehicles', () => {
    it('should allow Admin to create a vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          make: 'Toyota',
          model: 'RAV4',
          category: 'SUV',
          price: 30000,
          quantity: 3,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.make).toBe('Toyota');
      expect(res.body.quantity).toBe(3);
    });

    it('should block regular user from creating a vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          make: 'Toyota',
          model: 'RAV4',
          category: 'SUV',
          price: 30000,
          quantity: 3,
        });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
    });

    it('should block unauthenticated user', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .send({
          make: 'Toyota',
        });

      expect(res.status).toBe(401);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          make: 'Toyota',
          // model, category, price are missing
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/vehicles', () => {
    it('should return list of all vehicles for authenticated user', async () => {
      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].make).toBe('Honda');
    });

    it('should block unauthenticated user from listing', async () => {
      const res = await request(app).get('/api/vehicles');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/vehicles/search', () => {
    beforeEach(async () => {
      // Add more vehicles for search testing
      await prisma.vehicle.create({
        data: { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 28000, quantity: 2 },
      });
      await prisma.vehicle.create({
        data: { make: 'Ford', model: 'F-150', category: 'Truck', price: 45000, quantity: 1 },
      });
    });

    it('should search by make', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=Toyota')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].model).toBe('Camry');
    });

    it('should search by category', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?category=Sedan')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      // Civic and Camry are Sedans
      expect(res.body.length).toBe(2);
    });

    it('should filter by price range', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?minPrice=26000&maxPrice=40000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      // Only Camry is in this range (28000)
      expect(res.body.length).toBe(1);
      expect(res.body[0].make).toBe('Toyota');
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    it('should allow Admin to update a vehicle', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 24000,
          quantity: 10,
        });

      expect(res.status).toBe(200);
      expect(res.body.price).toBe(24000);
      expect(res.body.quantity).toBe(10);
    });

    it('should block regular user from updating', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          price: 24000,
        });

      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent vehicle ID', async () => {
      const res = await request(app)
        .put('/api/vehicles/non-existent-uuid')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 24000,
        });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('should allow Admin to delete a vehicle', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      // Verify it was deleted in db
      const deleted = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
      expect(deleted).toBeNull();
    });

    it('should block regular user from deleting', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });
});
