"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const router = (0, express_1.Router)();
// Route to fetch aggregated analytics overview metrics
router.get('/overview', analytics_controller_1.getOverview);
// Route to fetch click coordinates for page heatmap
router.get('/heatmap', analytics_controller_1.getHeatmap);
// Route to fetch session records for a project
router.get('/sessions', analytics_controller_1.getSessions);
// Route to fetch all registered projects
router.get('/projects', analytics_controller_1.getProjects);
// Route to fetch all tracked page URLs/paths for a project
router.get('/tracked-pages', analytics_controller_1.getTrackedPages);
exports.default = router;
