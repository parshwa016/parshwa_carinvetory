import request from 'supertest';
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
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
    // Force system time to a valid hour (12:00 PM noon) for standard tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-22T12:00:00'));

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
    vi.useRealTimers();
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

    it('should allow purchase if client timezone is inside operational hours even if server UTC time is outside', async () => {
      // Mock system time to 4:00 AM UTC
      vi.setSystemTime(new Date('2026-07-22T04:00:00Z'));

      // In Asia/Kolkata (+5:30), this is 9:30 AM (Operational)
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-timezone', 'Asia/Kolkata');

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(1); // 2 - 1 = 1
    });

    it('should block purchase if client timezone is outside operational hours even if server UTC time is inside', async () => {
      // Mock system time to 4:00 AM UTC
      vi.setSystemTime(new Date('2026-07-22T04:00:00Z'));

      // In America/New_York (-4:00 DST), this is 12:00 AM Midnight (Non-Operational)
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .set('x-timezone', 'America/New_York');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('allowed between 7:00 AM and 10:00 PM');
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

  describe('GET /api/vehicles/transactions', () => {
    beforeEach(async () => {
      // Clear transaction log before each test
      await prisma.transaction.deleteMany({});
    });

    it('should allow Admin to view recent transactions', async () => {
      // 1. Perform a purchase as user
      await request(app)
        .post(`/api/vehicles/${vehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      // 2. Fetch log as Admin
      const res = await request(app)
        .get('/api/vehicles/transactions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].userEmail).toBe('user@example.com');
      expect(res.body[0].vehicleMake).toBe('Honda');
      expect(res.body[0].vehicleModel).toBe('Civic');
    });

    it('should block regular user from viewing transaction history', async () => {
      const res = await request(app)
        .get('/api/vehicles/transactions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should block unauthenticated user from viewing transaction history', async () => {
      const res = await request(app).get('/api/vehicles/transactions');
      expect(res.status).toBe(401);
    });
  });
});
