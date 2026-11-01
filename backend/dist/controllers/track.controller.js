"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackEvents = trackEvents;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
/**
 * Controller to handle tracking events sent by the tracker.js script.
 * Validates the project, upserts the session (managing start, end, and duration),
 * and performs bulk insert of all events.
 */
async function trackEvents(req, res) {
    try {
        const { projectId, visitorId, sessionId, events } = req.body;
        // 1. Basic validation of request body
        if (!projectId || !visitorId || !sessionId || !events || !Array.isArray(events) || events.length === 0) {
            return res.status(400).json({ success: false, error: 'Invalid payload structure' });
        }
        // Sort incoming events chronologically to accurately determine boundaries
        const sortedEvents = [...events].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const firstEventDate = new Date(sortedEvents[0].createdAt);
        const latestEventDate = new Date(sortedEvents[sortedEvents.length - 1].createdAt);
        // Execute session upsert and bulk event insertion in a single transaction
        const result = await prisma_1.default.$transaction(async (tx) => {
            // Verify that the referenced project actually exists
            const project = await tx.project.findUnique({
                where: { id: projectId }
            });
            if (!project) {
                return { status: 404, message: `Project with ID ${projectId} does not exist.` };
            }
            // Check if this session already exists in the database
            const existingSession = await tx.session.findUnique({
                where: { id: sessionId }
            });
            if (!existingSession) {
                // Extract metadata from the first PAGE_VIEW event if available
                const pageViewEvent = sortedEvents.find(e => e.eventType === 'PAGE_VIEW');
                const browser = pageViewEvent?.payload?.browser || null;
                const os = pageViewEvent?.payload?.os || null;
                const deviceType = pageViewEvent?.payload?.deviceType || null;
                // Create new session
                await tx.session.create({
                    data: {
                        id: sessionId,
                        projectId,
                        visitorId,
                        browser,
                        os,
                        deviceType,
                        startedAt: firstEventDate,
                        endedAt: latestEventDate,
                        durationSeconds: Math.max(0, Math.floor((latestEventDate.getTime() - firstEventDate.getTime()) / 1000))
                    }
                });
            }
            else {
                // Update the end time and total session duration
                const currentEndedAt = existingSession.endedAt ? new Date(existingSession.endedAt) : null;
                const finalEndedAt = currentEndedAt && currentEndedAt > latestEventDate ? currentEndedAt : latestEventDate;
                const durationSeconds = Math.max(0, Math.floor((finalEndedAt.getTime() - new Date(existingSession.startedAt).getTime()) / 1000));
                await tx.session.update({
                    where: { id: sessionId },
                    data: {
                        endedAt: finalEndedAt,
                        durationSeconds
                    }
                });
            }
            // Format events to conform with the Prisma schema Event model
            const eventsToInsert = sortedEvents.map(e => {
                let type;
                switch (e.eventType) {
                    case 'PAGE_VIEW':
                        type = client_1.EventType.PAGE_VIEW;
                        break;
                    case 'CLICK':
                        type = client_1.EventType.CLICK;
                        break;
                    case 'SCROLL':
                        type = client_1.EventType.SCROLL;
                        break;
                    default:
                        type = client_1.EventType.CUSTOM;
                }
                return {
                    sessionId,
                    projectId,
                    eventType: type,
                    pageUrl: e.pageUrl || '',
                    payload: e.payload || {},
                    createdAt: new Date(e.createdAt)
                };
            });
            // Insert all events in bulk (high-efficiency operation)
            await tx.event.createMany({
                data: eventsToInsert
            });
            return { status: 200, message: 'Events tracked successfully' };
        });
        if (result.status !== 200) {
            return res.status(result.status).json({ success: false, error: result.message });
        }
        return res.status(200).json({ success: true, message: result.message });
    }
    catch (error) {
        console.error('[Tracking Controller Error]:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
