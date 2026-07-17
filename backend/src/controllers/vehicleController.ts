import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import prisma from '../db';

export const createVehicle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { make, model, category, price, quantity } = req.body;

    if (!make || !model || !category || price === undefined) {
      return res.status(400).json({ error: 'make, model, category, and price are required' });
    }

    const priceNum = parseFloat(price);
    const qtyNum = quantity !== undefined ? parseInt(quantity) : 1;

    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    if (isNaN(qtyNum) || qtyNum < 0) {
      return res.status(400).json({ error: 'Quantity must be a positive integer' });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        make,
        model,
        category,
        price: priceNum,
        quantity: qtyNum,
      },
    });

    return res.status(201).json(vehicle);
  } catch (error) {
    console.error('Create vehicle error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const listVehicles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(vehicles);
  } catch (error) {
    console.error('List vehicles error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const searchVehicles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { make, model, category, minPrice, maxPrice } = req.query;

    const whereClause: any = {};

    if (make) {
      whereClause.make = { contains: String(make) };
    }
    if (model) {
      whereClause.model = { contains: String(model) };
    }
    if (category) {
      whereClause.category = { contains: String(category) };
    }

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) {
        whereClause.price.gte = parseFloat(String(minPrice));
      }
      if (maxPrice) {
        whereClause.price.lte = parseFloat(String(maxPrice));
      }
    }

    const vehicles = await prisma.vehicle.findMany({
      where: whereClause,
      orderBy: { price: 'asc' },
    });

    return res.status(200).json(vehicles);
  } catch (error) {
    console.error('Search vehicles error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateVehicle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { make, model, category, price, quantity } = req.body;

    const existingVehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const updateData: any = {};
    if (make !== undefined) updateData.make = make;
    if (model !== undefined) updateData.model = model;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }
      updateData.price = priceNum;
    }
    if (quantity !== undefined) {
      const qtyNum = parseInt(quantity);
      if (isNaN(qtyNum) || qtyNum < 0) {
        return res.status(400).json({ error: 'Quantity must be a positive integer' });
      }
      updateData.quantity = qtyNum;
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json(updatedVehicle);
  } catch (error) {
    console.error('Update vehicle error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteVehicle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingVehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await prisma.vehicle.delete({ where: { id } });

    return res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const purchaseVehicle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (vehicle.quantity <= 0) {
      return res.status(400).json({ error: 'Vehicle is out of stock' });
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        quantity: vehicle.quantity - 1,
      },
    });

    return res.status(200).json(updatedVehicle);
  } catch (error) {
    console.error('Purchase vehicle error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const restockVehicle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const restockQty = quantity === undefined ? 1 : parseInt(quantity);
    if (isNaN(restockQty) || restockQty <= 0) {
      return res.status(400).json({ error: 'Restock quantity must be a positive integer' });
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        quantity: vehicle.quantity + restockQty,
      },
    });

    return res.status(200).json(updatedVehicle);
  } catch (error) {
    console.error('Restock vehicle error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
