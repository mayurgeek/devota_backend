import { Router } from 'express';
import * as projectController from '../controllers/project.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/check-access', projectController.checkAccess);

// Protected admin routes
router.get('/projects', authMiddleware, adminMiddleware, projectController.getAllProjects);
router.post('/create-project', authMiddleware, adminMiddleware, projectController.createProject);
router.post('/block-project', authMiddleware, adminMiddleware, projectController.blockProject);
router.post('/unblock-project', authMiddleware, adminMiddleware, projectController.unblockProject);

export default router; 