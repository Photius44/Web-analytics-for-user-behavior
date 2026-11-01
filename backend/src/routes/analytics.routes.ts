import { Router } from 'express';
import { getOverview, getHeatmap, getSessions, getProjects, getTrackedPages } from '../controllers/analytics.controller';

const router = Router();

// Route to fetch aggregated analytics overview metrics
router.get('/overview', getOverview);

// Route to fetch click coordinates for page heatmap
router.get('/heatmap', getHeatmap);

// Route to fetch session records for a project
router.get('/sessions', getSessions);

// Route to fetch all registered projects
router.get('/projects', getProjects);

// Route to fetch all tracked page URLs/paths for a project
router.get('/tracked-pages', getTrackedPages);

export default router;
