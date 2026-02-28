import { Router } from 'express';
import {
    getPartners,
    getAllPartners,
    createPartner,
    updatePartner,
    deletePartner,
} from '../controllers/partnerController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getPartners);

// Admin routes
router.get('/admin/all'
    //authenticate, requireRole('admin')
    , getAllPartners);
router.post('/', authenticate, requireRole('admin'), createPartner);
router.put('/:id', authenticate, requireRole('admin'), updatePartner);
router.delete('/:id', authenticate, requireRole('admin'), deletePartner);

export default router;