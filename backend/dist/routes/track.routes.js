"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const track_controller_1 = require("../controllers/track.controller");
const router = (0, express_1.Router)();
// Route to ingest tracking event batches from tracker.js
router.post('/track', track_controller_1.trackEvents);
exports.default = router;
