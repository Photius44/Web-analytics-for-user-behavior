"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOverview = getOverview;
exports.getHeatmap = getHeatmap;
exports.getSessions = getSessions;
exports.getProjects = getProjects;
exports.getTrackedPages = getTrackedPages;
const prisma_1 = __importDefault(require("../lib/prisma"));
/**
 * Controller to handle analytics aggregation requests.
 * Fetches metrics for total visitors, pageviews, average session duration,
 * bounce rate, device types breakdown, and top pages.
 */
async function getOverview(req, res) {
    try {
        const { projectId, range } = req.query;
        // Validate that projectId is provided
        if (!projectId || typeof projectId !== 'string') {
            return res.status(400).json({ success: false, error: 'projectId is required' });
        }
        // Determine the date boundary based on range parameter (default: 7d)
        const rangeStr = typeof range === 'string' ? range : '7d';
        const startDate = new Date();
        if (rangeStr === '30d') {
            startDate.setDate(startDate.getDate() - 30);
        }
        else if (rangeStr === '90d') {
            startDate.setDate(startDate.getDate() - 90);
        }
        else {
            startDate.setDate(startDate.getDate() - 7); // Default to 7d
        }
        // 1. KPI Metrics Calculations
        // Total Visitors: unique visitorId count in Session table within date range
        const uniqueVisitorsResult = await prisma_1.default.session.groupBy({
            by: ['visitorId'],
            where: {
                projectId,
                startedAt: { gte: startDate }
            }
        });
        const totalVisitors = uniqueVisitorsResult.length;
        // Page Views: count events where eventType = 'PAGE_VIEW' within date range
        const pageViews = await prisma_1.default.event.count({
            where: {
                projectId,
                eventType: 'PAGE_VIEW',
                createdAt: { gte: startDate }
            }
        });
        // Avg. Session Duration: average durationSeconds in Session table
        const avgDurationResult = await prisma_1.default.session.aggregate({
            where: {
                projectId,
                startedAt: { gte: startDate }
            },
            _avg: {
                durationSeconds: true
            }
        });
        const avgSeconds = Math.round(avgDurationResult._avg.durationSeconds || 0);
        // Format average duration into user-friendly format (e.g. "4m 32s")
        const minutes = Math.floor(avgSeconds / 60);
        const seconds = avgSeconds % 60;
        const avgSessionDuration = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
        // Bounce Rate: % of sessions that have durationSeconds = 0, durationSeconds = null, or exactly 1 event
        const sessionsForBounce = await prisma_1.default.session.findMany({
            where: {
                projectId,
                startedAt: { gte: startDate }
            },
            select: {
                durationSeconds: true,
                _count: {
                    select: { events: true }
                }
            }
        });
        const totalSessions = sessionsForBounce.length;
        const bouncedSessions = sessionsForBounce.filter(s => s.durationSeconds === 0 ||
            s.durationSeconds === null ||
            s._count.events === 1).length;
        const bounceRateVal = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;
        const bounceRate = `${bounceRateVal.toFixed(1)}%`;
        // 2. Breakdown Calculations (Widgets & Charts)
        // Device Types Breakdown
        const deviceGroups = await prisma_1.default.session.groupBy({
            by: ['deviceType'],
            where: {
                projectId,
                startedAt: { gte: startDate }
            },
            _count: {
                _all: true
            }
        });
        const totalSessionsForDevice = deviceGroups.reduce((acc, curr) => acc + curr._count._all, 0);
        const deviceTypes = deviceGroups.map(g => ({
            type: g.deviceType || 'Unknown',
            count: g._count._all,
            percentage: totalSessionsForDevice > 0 ? Math.round((g._count._all / totalSessionsForDevice) * 100) : 0
        }));
        // Top Pages: group PAGE_VIEW events by pageUrl, order descending, take top 5
        const topPagesData = await prisma_1.default.event.groupBy({
            by: ['pageUrl'],
            where: {
                projectId,
                eventType: 'PAGE_VIEW',
                createdAt: { gte: startDate }
            },
            _count: {
                pageUrl: true
            },
            orderBy: {
                _count: {
                    pageUrl: 'desc'
                }
            },
            take: 5
        });
        const topPages = topPagesData.map(p => ({
            url: p.pageUrl,
            views: p._count.pageUrl
        }));
        // 3. Time-Series chart data (pageviews/visitors/sessions grouped by date)
        const daysCount = rangeStr === '30d' ? 30 : rangeStr === '90d' ? 90 : 7;
        const chartStartDate = new Date();
        chartStartDate.setDate(chartStartDate.getDate() - daysCount);
        chartStartDate.setHours(0, 0, 0, 0);
        const sessionsForChart = await prisma_1.default.session.findMany({
            where: {
                projectId,
                startedAt: { gte: chartStartDate }
            },
            select: {
                id: true,
                visitorId: true,
                startedAt: true
            }
        });
        const pageviewsForChart = await prisma_1.default.event.findMany({
            where: {
                projectId,
                eventType: 'PAGE_VIEW',
                createdAt: { gte: chartStartDate }
            },
            select: {
                createdAt: true
            }
        });
        // Generate consecutive dates list (including today)
        const datesList = [];
        for (let i = daysCount; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            datesList.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        // Map to accumulate counts
        const chartMap = new Map();
        for (const dateStr of datesList) {
            chartMap.set(dateStr, {
                date: dateStr,
                visitors: new Set(),
                pageviews: 0,
                sessions: new Set()
            });
        }
        // Populate sessions
        for (const s of sessionsForChart) {
            const dateStr = new Date(s.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const entry = chartMap.get(dateStr);
            if (entry) {
                entry.visitors.add(s.visitorId);
                entry.sessions.add(s.id);
            }
        }
        // Populate pageviews
        for (const pv of pageviewsForChart) {
            const dateStr = new Date(pv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const entry = chartMap.get(dateStr);
            if (entry) {
                entry.pageviews += 1;
            }
        }
        const chartData = Array.from(chartMap.values()).map(item => ({
            date: item.date,
            visitors: item.visitors.size,
            pageviews: item.pageviews,
            sessions: item.sessions.size
        }));
        // 4. Dynamic Traffic Sources & Conversion Funnel Calculation
        const sessions = await prisma_1.default.session.findMany({
            where: {
                projectId,
                startedAt: { gte: startDate }
            },
            include: {
                events: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });
        const sourcesMap = new Map();
        // Prepopulate standard sources:
        const standardSources = ['Google', 'Direct', 'Twitter', 'Newsletter', 'GitHub'];
        const typeColorsMap = {
            Google: { type: "Organic", color: "var(--teal-500)" },
            Direct: { type: "Direct", color: "var(--indigo-500)" },
            Twitter: { type: "Social", color: "var(--amber-500)" },
            LinkedIn: { type: "Social", color: "var(--chart-4)" },
            Newsletter: { type: "Email", color: "var(--rose-500)" },
            GitHub: { type: "Referral", color: "var(--success)" },
        };
        for (const src of standardSources) {
            const cfg = typeColorsMap[src];
            sourcesMap.set(src, { source: src, type: cfg.type, visitors: 0, converted: 0, color: cfg.color });
        }
        let rageClickSessionsCount = 0;
        // Funnel counters
        let funnelLanded = 0;
        let funnelBooks = 0;
        let funnelCart = 0;
        let funnelSuccess = 0;
        for (const sess of sessions) {
            // 1. Rage Click session: defined as session with total events >= 5
            const totalEvents = sess.events.length;
            if (totalEvents >= 5) {
                rageClickSessionsCount++;
            }
            // Filter page view events
            const pageViews = sess.events.filter(e => e.eventType === 'PAGE_VIEW');
            if (pageViews.length === 0)
                continue;
            // 2. Traffic Source: determined by first page view event in the session
            const firstEvent = pageViews[0];
            let source = 'Direct';
            try {
                const url = new URL(firstEvent.pageUrl);
                const utm = url.searchParams.get('utm_source');
                if (utm) {
                    source = utm.charAt(0).toUpperCase() + utm.slice(1).toLowerCase();
                }
                else {
                    const payload = firstEvent.payload;
                    const ref = payload?.referrer || '';
                    if (ref) {
                        const refUrl = new URL(ref);
                        if (refUrl.hostname.includes('google.')) {
                            source = 'Google';
                        }
                        else if (refUrl.hostname.includes('twitter.com') || refUrl.hostname.includes('t.co')) {
                            source = 'Twitter';
                        }
                        else if (refUrl.hostname.includes('linkedin.com')) {
                            source = 'LinkedIn';
                        }
                        else if (refUrl.hostname.includes('github.com')) {
                            source = 'GitHub';
                        }
                        else if (refUrl.hostname && !refUrl.hostname.includes('localhost') && !refUrl.hostname.includes(url.hostname)) {
                            source = refUrl.hostname.replace('www.', '');
                        }
                    }
                }
            }
            catch (err) {
                const payload = firstEvent.payload;
                const ref = payload?.referrer || '';
                if (ref) {
                    if (ref.includes('google.'))
                        source = 'Google';
                    else if (ref.includes('twitter.com') || ref.includes('t.co'))
                        source = 'Twitter';
                    else if (ref.includes('linkedin.com'))
                        source = 'LinkedIn';
                    else if (ref.includes('github.com'))
                        source = 'GitHub';
                    else
                        source = 'Referral';
                }
            }
            if (!sourcesMap.has(source)) {
                let type = 'Referral';
                let color = 'var(--success)';
                const lower = source.toLowerCase();
                if (lower.includes('google') || lower.includes('bing') || lower.includes('yahoo')) {
                    type = 'Organic';
                    color = 'var(--teal-500)';
                }
                else if (lower.includes('twitter') || lower.includes('facebook') || lower.includes('instagram') || lower.includes('linkedin')) {
                    type = 'Social';
                    color = 'var(--amber-500)';
                }
                else if (lower.includes('newsletter') || lower.includes('email') || lower.includes('mail')) {
                    type = 'Email';
                    color = 'var(--rose-500)';
                }
                sourcesMap.set(source, { source, type, visitors: 0, converted: 0, color });
            }
            const entry = sourcesMap.get(source);
            entry.visitors++;
            // Check conversion (session viewed success/settings/checkout)
            const hasConverted = pageViews.some(e => {
                const url = e.pageUrl.toLowerCase();
                return url.endsWith('/success.html') || url.includes('/settings') || url.includes('/checkout');
            });
            if (hasConverted) {
                entry.converted++;
            }
            // 3. Funnel Steps View Counters
            for (const e of pageViews) {
                const url = e.pageUrl.toLowerCase();
                if (url.endsWith('/index.html') || url.endsWith('/home') || url.endsWith('/') || url === '') {
                    funnelLanded++;
                }
                else if (url.includes('/books.html') || url.includes('/products') || url.includes('/analytics') || url.includes('/heatmap')) {
                    funnelBooks++;
                }
                else if (url.includes('/cart.html') || url.includes('/sessions') || url.includes('/ai-insights')) {
                    funnelCart++;
                }
                else if (url.includes('/success.html') || url.includes('/settings') || url.includes('/checkout')) {
                    funnelSuccess++;
                }
            }
        }
        const trafficSourcesData = Array.from(sourcesMap.values()).map(s => {
            const convRate = s.visitors > 0 ? parseFloat(((s.converted / s.visitors) * 100).toFixed(1)) : 0.0;
            return {
                source: s.source,
                type: s.type,
                visitors: s.visitors,
                convRate,
                color: s.color
            };
        });
        const funnelSteps = [
            { step: "Landed", visitors: funnelLanded, percentage: 100, dropoff: 0 },
            { step: "Viewed Books", visitors: funnelBooks, percentage: 0, dropoff: 0 },
            { step: "Viewed Cart", visitors: funnelCart, percentage: 0, dropoff: 0 },
            { step: "Completed Purchase", visitors: funnelSuccess, percentage: 0, dropoff: 0 }
        ];
        const totalLanded = funnelLanded;
        funnelSteps.forEach((s, idx) => {
            if (idx === 0) {
                s.percentage = totalLanded > 0 ? 100 : 0;
                s.dropoff = 0;
            }
            else {
                const prev = funnelSteps[idx - 1];
                s.percentage = totalLanded > 0 ? Math.round((s.visitors / totalLanded) * 100) : 0;
                s.dropoff = prev.visitors > 0 ? Math.round(((prev.visitors - s.visitors) / prev.visitors) * 100) : 0;
                if (s.dropoff < 0)
                    s.dropoff = 0;
            }
        });
        // Return the formatted payload
        return res.status(200).json({
            success: true,
            data: {
                kpis: {
                    totalVisitors,
                    pageViews,
                    avgSessionDuration,
                    bounceRate
                },
                deviceTypes,
                topPages,
                chartData,
                rageClickSessionsCount,
                trafficSources: trafficSourcesData,
                funnel: funnelSteps
            }
        });
    }
    catch (error) {
        console.error('[Analytics Controller Error]:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
/**
 * Controller to fetch click coordinate points for rendering heatmaps.
 * Filters events by projectId, eventType = 'CLICK', and pageUrl.
 */
async function getHeatmap(req, res) {
    try {
        const { projectId, pageUrl } = req.query;
        if (!projectId || typeof projectId !== 'string') {
            return res.status(400).json({ success: false, error: 'projectId is required' });
        }
        if (!pageUrl || typeof pageUrl !== 'string') {
            return res.status(400).json({ success: false, error: 'pageUrl is required' });
        }
        const decodedUrl = decodeURIComponent(pageUrl);
        // Query all CLICK events matching criteria (exact or endsWith pathname suffix)
        const clickEvents = await prisma_1.default.event.findMany({
            where: {
                projectId,
                eventType: 'CLICK',
                OR: [
                    { pageUrl: decodedUrl },
                    { pageUrl: { endsWith: decodedUrl } }
                ]
            },
            select: {
                payload: true
            }
        });
        // Safely extract coordinates from payload Jsonb column
        const points = clickEvents
            .map(evt => {
            const payload = evt.payload;
            if (payload &&
                typeof payload === 'object' &&
                typeof payload.x === 'number' &&
                typeof payload.y === 'number') {
                return { x: payload.x, y: payload.y, value: 1 };
            }
            return null;
        })
            .filter((pt) => pt !== null);
        return res.status(200).json({
            success: true,
            data: points
        });
    }
    catch (error) {
        console.error('[Heatmap Controller Error]:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
/**
 * Controller to fetch session records for a project, optionally filtered by type.
 * Supports filtering by 'bounce' (durationSeconds = 0) and 'rage_click' (high event density).
 */
async function getSessions(req, res) {
    try {
        const { projectId, filterType } = req.query;
        if (!projectId || typeof projectId !== 'string') {
            return res.status(400).json({ success: false, error: 'projectId is required' });
        }
        const whereClause = {
            projectId
        };
        if (filterType === 'bounce') {
            whereClause.durationSeconds = 0;
        }
        // Query sessions with their corresponding event count
        const sessions = await prisma_1.default.session.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: { events: true }
                }
            },
            orderBy: {
                startedAt: 'desc'
            }
        });
        // Map database results to the required API structure
        let mappedSessions = sessions.map(s => ({
            id: s.id,
            visitorId: s.visitorId,
            browser: s.browser || 'Unknown',
            os: s.os || 'Unknown',
            deviceType: s.deviceType || 'Desktop',
            durationSeconds: s.durationSeconds,
            startedAt: s.startedAt,
            eventCount: s._count.events
        }));
        if (filterType === 'rage_click') {
            // Simulate rage click filter: find sessions with elevated event counts (>= 5 events)
            mappedSessions = mappedSessions.filter(s => s.eventCount >= 5);
        }
        return res.status(200).json({
            success: true,
            data: mappedSessions
        });
    }
    catch (error) {
        console.error('[Sessions Controller Error]:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
/**
 * Controller to fetch all registered projects.
 */
async function getProjects(req, res) {
    try {
        const projects = await prisma_1.default.project.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        return res.status(200).json({
            success: true,
            data: projects
        });
    }
    catch (error) {
        console.error('[Projects Controller Error]:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
/**
 * Controller to fetch distinct page paths tracked for a project.
 */
async function getTrackedPages(req, res) {
    try {
        const { projectId } = req.query;
        if (!projectId || typeof projectId !== 'string') {
            return res.status(400).json({ success: false, error: 'projectId is required' });
        }
        const events = await prisma_1.default.event.findMany({
            where: { projectId },
            select: { pageUrl: true },
            distinct: ['pageUrl']
        });
        // Extract pathname paths (e.g. /books.html instead of http://localhost:5173/books.html)
        const pathsSet = new Set();
        for (const e of events) {
            if (!e.pageUrl)
                continue;
            try {
                const urlObj = new URL(e.pageUrl);
                pathsSet.add(urlObj.pathname);
            }
            catch (err) {
                // Fallback in case it is already a pathname or partial URL
                pathsSet.add(e.pageUrl);
            }
        }
        const paths = Array.from(pathsSet).sort();
        return res.status(200).json({
            success: true,
            data: paths
        });
    }
    catch (error) {
        console.error('[Tracked Pages Controller Error]:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
