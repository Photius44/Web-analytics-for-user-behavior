"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const track_routes_1 = __importDefault(require("./routes/track.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
require("dotenv/config");
const morgan_1 = __importDefault(require("morgan"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Apply CORS middleware to enable cross-origin stream logging from external client websites
app.use((0, cors_1.default)({
    origin: '*', // Allows tracking beacons from any origin
    methods: ['POST', 'OPTIONS', 'GET'],
    allowedHeaders: ['Content-Type']
}));
// Built-in JSON parser for request payload processing
app.use(express_1.default.json());
// Cho phép gọi file tracker.js trực tiếp từ server backend
app.use(express_1.default.static('public'));
//Bind request logger to track
app.use((0, morgan_1.default)('dev'));
// Bind tracking routes to '/api' prefix -> maps to /api/track
app.use('/api', track_routes_1.default);
app.use('/api', project_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
// Server health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});
// Run server
app.listen(PORT, () => {
    console.log(`[Analytics Server] running on http://localhost:${PORT}`);
});
