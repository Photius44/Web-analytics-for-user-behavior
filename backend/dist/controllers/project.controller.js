"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProject = createProject;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * Controller to handle creating a new project.
 * Accepts name and domain (website URL/domain) from req.body.
 */
async function createProject(req, res) {
    try {
        const { name, domain } = req.body;
        // 1. Basic validation
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Project name is required and must be a non-empty string.',
            });
        }
        if (!domain || typeof domain !== 'string' || !domain.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Website URL/domain is required and must be a non-empty string.',
            });
        }
        // 2. Clean the domain
        // If the user pastes a full URL (e.g., https://example.com/blog), extract just the host (example.com).
        let cleanDomain = domain.trim();
        try {
            if (cleanDomain.startsWith('http://') || cleanDomain.startsWith('https://')) {
                const urlObj = new URL(cleanDomain);
                cleanDomain = urlObj.host; // This returns host including port, e.g. "localhost:8080" or "example.com"
            }
        }
        catch (e) {
            // If parsing fails, fall back to the trimmed input string.
        }
        // 3. Create record in Project table
        // Prisma will autogenerate the UUID for project.id since it has @default(uuid())
        const project = await prisma_1.default.project.create({
            data: {
                name: name.trim(),
                domain: cleanDomain,
            },
        });
        // 4. Return the created project object including its generated id.
        return res.status(201).json({
            success: true,
            data: project,
        });
    }
    catch (error) {
        console.error('[Create Project Controller Error]:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
        });
    }
}
