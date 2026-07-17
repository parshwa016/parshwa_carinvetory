import request from 'supertest';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import app from '../app';
import prisma from '../db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-jwt-key-dealership';

describe('Inventory Endpoints', () => {
  let userToken: string;
  let adminToken: string;
  let vehicleId: string;
  let outOfStockVehicleId: string;

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

    // Create sample vehicles
    const vehicle = await prisma.vehicle.create({
      data: {
        make: 'Honda',
        model: 'Civic',
        category: 'Sedan',
        price: 25000,
        quantity: 2, // 2 in stock
      },
    });
    vehicleId = vehicle.id;

    const outOfStock = await prisma.vehicle.create({
      data: {
        make: 'Tesla',
        model: 'Model 3',
        category: 'Sedan',
        price: 40000,
        quantity: 0, // Out of stock
      },
    });
    outOfStockVehicleId = outOfStock.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/vehicles/:id/purchase', () => {
    it('should allow authenticated user to purchase a vehicle, decreasing quantity', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(1); // 2 - 1 = 1

      // Verify db quantity
      const updated = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
      expect(updated?.quantity).toBe(1);
    });

    it('should return 400 if vehicle is out of stock', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${outOfStockVehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('out of stock');
    });

    it('should return 404 for non-existent vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles/non-existent-uuid/purchase')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });

    it('should block unauthenticated user from purchasing', async () => {
      const res = await request(app).post(`/api/vehicles/${vehicleId}/purchase`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/vehicles/:id/restock', () => {
    it('should allow Admin to restock a vehicle, increasing quantity', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(7); // 2 + 5 = 7

      const updated = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
      expect(updated?.quantity).toBe(7);
    });

    it('should default to restock quantity of 1 if none provided', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({}); // Empty body

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(3); // 2 + 1 = 3
    });

    it('should block regular user from restocking', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(403);
    });

    it('should return 400 for invalid restock quantity', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: -2 }); // Negative number

      expect(res.status).toBe(400);
    });
  });
});
