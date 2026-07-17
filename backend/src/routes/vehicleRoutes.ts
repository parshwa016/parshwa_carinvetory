import { Router } from 'express';
import {
  createVehicle,
  listVehicles,
  searchVehicles,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle,
} from '../controllers/vehicleController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Order matters: list search first, otherwise it gets treated as /:id
router.get('/search', authenticateToken as any, searchVehicles as any);
router.get('/', authenticateToken as any, listVehicles as any);
router.post('/', authenticateToken as any, requireAdmin as any, createVehicle as any);
router.put('/:id', authenticateToken as any, requireAdmin as any, updateVehicle as any);
router.delete('/:id', authenticateToken as any, requireAdmin as any, deleteVehicle as any);

router.post('/:id/purchase', authenticateToken as any, purchaseVehicle as any);
router.post('/:id/restock', authenticateToken as any, requireAdmin as any, restockVehicle as any);

export default router;
