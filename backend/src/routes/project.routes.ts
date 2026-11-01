import { Router } from 'express';
import { createProject } from '../controllers/project.controller';

const router = Router();

// Route to create a new project
router.post('/projects', createProject);

export default router;
