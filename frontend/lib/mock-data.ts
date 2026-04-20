// KPI Data
export const kpiData = {
  totalVisitors: {
    value: "128,543",
    change: 12.5,
    trend: "up" as const,
    sparkline: [30, 40, 35, 50, 49, 60, 70, 91, 85, 95, 100, 110],
  },
  pageViews: {
    value: "543,210",
    change: 8.2,
    trend: "up" as const,
    sparkline: [20, 35, 45, 40, 55, 65, 60, 75, 80, 85, 90, 95],
  },
  avgSessionDuration: {
    value: "4m 32s",
    change: -2.1,
    trend: "down" as const,
    sparkline: [50, 45, 48, 42, 40, 38, 35, 38, 36, 34, 32, 35],
  },
  bounceRate: {
    value: "42.3%",
    change: -5.4,
    trend: "down" as const,
    sparkline: [55, 52, 50, 48, 45, 44, 42, 43, 41, 40, 42, 38],
  },
};

// Chart Data for visitors/pageviews/sessions
export const chartData = [
  { date: "Jan 1", visitors: 4000, pageviews: 12000, sessions: 6000 },
  { date: "Jan 2", visitors: 3000, pageviews: 9800, sessions: 5200 },
  { date: "Jan 3", visitors: 5000, pageviews: 15200, sessions: 7800 },
  { date: "Jan 4", visitors: 4500, pageviews: 14100, sessions: 7200 },
  { date: "Jan 5", visitors: 6000, pageviews: 18500, sessions: 9500 },
  { date: "Jan 6", visitors: 5500, pageviews: 17200, sessions: 8800 },
  { date: "Jan 7", visitors: 7000, pageviews: 21000, sessions: 10500 },
  { date: "Jan 8", visitors: 6500, pageviews: 19800, sessions: 9900 },
  { date: "Jan 9", visitors: 8000, pageviews: 24500, sessions: 12200 },
  { date: "Jan 10", visitors: 7500, pageviews: 23100, sessions: 11500 },
  { date: "Jan 11", visitors: 9000, pageviews: 27800, sessions: 13800 },
  { date: "Jan 12", visitors: 8500, pageviews: 26200, sessions: 13100 },
  { date: "Jan 13", visitors: 10000, pageviews: 31000, sessions: 15500 },
  { date: "Jan 14", visitors: 9500, pageviews: 29500, sessions: 14700 },
];

// Top Pages
export const topPages = [
  { page: "/home", views: 45230, change: 12.3 },
  { page: "/products", views: 32150, change: 8.7 },
  { page: "/pricing", views: 21420, change: -2.1 },
  { page: "/about", views: 15890, change: 5.4 },
  { page: "/contact", views: 12340, change: 15.2 },
];

// Traffic Sources
export const trafficSources = [
  { name: "Direct", value: 35, fill: "var(--chart-1)" },
  { name: "Organic", value: 28, fill: "var(--chart-2)" },
  { name: "Referral", value: 20, fill: "var(--chart-3)" },
  { name: "Social", value: 12, fill: "var(--chart-4)" },
  { name: "Email", value: 5, fill: "var(--chart-5)" },
];

// Device Types
export const deviceTypes = [
  { name: "Desktop", value: 55, fill: "var(--chart-1)" },
  { name: "Mobile", value: 35, fill: "var(--chart-2)" },
  { name: "Tablet", value: 10, fill: "var(--chart-3)" },
];

// AI Insights
export const aiInsights = [
  {
    id: 1,
    title: "High bounce rate detected on landing page",
    explanation: "The landing page has a bounce rate of 68%, which is 25% higher than industry average.",
    recommendation: "Consider adding more engaging content above the fold and reducing page load time.",
    severity: "high" as const,
    correlatedSessionIds: ["sess_001", "sess_005", "sess_008"],
  },
  {
    id: 2,
    title: "CTA button is not receiving enough clicks",
    explanation: "Your primary CTA has a click-through rate of only 1.2%, below the expected 3-5%.",
    recommendation: "Move the CTA higher on the page and use more contrasting colors.",
    severity: "high" as const,
    correlatedSessionIds: ["sess_002", "sess_004", "sess_006"],
  },
  {
    id: 3,
    title: "Mobile users have longer session times",
    explanation: "Mobile sessions average 6m 45s compared to 3m 20s on desktop.",
    recommendation: "Optimize desktop experience to match mobile engagement levels.",
    severity: "medium" as const,
    correlatedSessionIds: ["sess_002", "sess_006", "sess_007"],
  },
  {
    id: 4,
    title: "Peak traffic occurs between 2-4 PM",
    explanation: "67% of your daily traffic comes during this 2-hour window.",
    recommendation: "Schedule important content releases and campaigns during peak hours.",
    severity: "low" as const,
    correlatedSessionIds: ["sess_001", "sess_003", "sess_008"],
  },
];

// Funnel Data
export const funnelData = [
  { step: "Landed", visitors: 128543, percentage: 100, dropoff: 0 },
  { step: "Viewed Pricing", visitors: 51417, percentage: 40, dropoff: 60 },
  { step: "Clicked Sign Up", visitors: 19281, percentage: 15, dropoff: 62.5 },
  { step: "Registered", visitors: 12854, percentage: 10, dropoff: 33.3 },
];

// UX Suggestions
export const uxSuggestions = [
  { id: 1, suggestion: "Move CTA higher on the page", impact: "high", completed: false },
  { id: 2, suggestion: "Improve page load speed by 40%", impact: "high", completed: false },
  { id: 3, suggestion: "Simplify navigation menu structure", impact: "medium", completed: true },
  { id: 4, suggestion: "Add trust signals near checkout", impact: "medium", completed: false },
  { id: 5, suggestion: "Implement lazy loading for images", impact: "low", completed: true },
  { id: 6, suggestion: "Reduce form fields from 8 to 5", impact: "medium", completed: false },
];

// Sessions Data
export const sessionsData = [
  { id: "sess_001", duration: "5m 32s", pages: 8, device: "Desktop", location: "New York, US", timestamp: "2 min ago" },
  { id: "sess_002", duration: "3m 18s", pages: 4, device: "Mobile", location: "London, UK", timestamp: "5 min ago" },
  { id: "sess_003", duration: "8m 45s", pages: 12, device: "Desktop", location: "Tokyo, JP", timestamp: "8 min ago" },
  { id: "sess_004", duration: "2m 10s", pages: 3, device: "Tablet", location: "Sydney, AU", timestamp: "12 min ago" },
  { id: "sess_005", duration: "6m 22s", pages: 9, device: "Desktop", location: "Berlin, DE", timestamp: "15 min ago" },
  { id: "sess_006", duration: "4m 55s", pages: 6, device: "Mobile", location: "Paris, FR", timestamp: "18 min ago" },
  { id: "sess_007", duration: "1m 42s", pages: 2, device: "Mobile", location: "Toronto, CA", timestamp: "22 min ago" },
  { id: "sess_008", duration: "7m 08s", pages: 10, device: "Desktop", location: "Singapore", timestamp: "25 min ago" },
];

// Analytics Page — hourly distribution
export const hourlyData = [
  { hour: "12a", visitors: 120, pageviews: 350, sessions: 180, bounceRate: 55 },
  { hour: "1a",  visitors: 80,  pageviews: 230, sessions: 110, bounceRate: 60 },
  { hour: "2a",  visitors: 60,  pageviews: 170, sessions: 85,  bounceRate: 63 },
  { hour: "3a",  visitors: 40,  pageviews: 115, sessions: 60,  bounceRate: 65 },
  { hour: "4a",  visitors: 55,  pageviews: 150, sessions: 75,  bounceRate: 62 },
  { hour: "5a",  visitors: 90,  pageviews: 260, sessions: 130, bounceRate: 58 },
  { hour: "6a",  visitors: 210, pageviews: 610, sessions: 310, bounceRate: 50 },
  { hour: "7a",  visitors: 420, pageviews: 1200, sessions: 620, bounceRate: 46 },
  { hour: "8a",  visitors: 780, pageviews: 2300, sessions: 1100, bounceRate: 42 },
  { hour: "9a",  visitors: 1100, pageviews: 3300, sessions: 1600, bounceRate: 40 },
  { hour: "10a", visitors: 1350, pageviews: 4100, sessions: 1950, bounceRate: 38 },
  { hour: "11a", visitors: 1500, pageviews: 4600, sessions: 2200, bounceRate: 37 },
  { hour: "12p", visitors: 1620, pageviews: 5000, sessions: 2400, bounceRate: 36 },
  { hour: "1p",  visitors: 1750, pageviews: 5400, sessions: 2600, bounceRate: 35 },
  { hour: "2p",  visitors: 1900, pageviews: 5900, sessions: 2800, bounceRate: 34 },
  { hour: "3p",  visitors: 1820, pageviews: 5600, sessions: 2700, bounceRate: 35 },
  { hour: "4p",  visitors: 1600, pageviews: 4900, sessions: 2400, bounceRate: 37 },
  { hour: "5p",  visitors: 1400, pageviews: 4200, sessions: 2100, bounceRate: 39 },
  { hour: "6p",  visitors: 1200, pageviews: 3600, sessions: 1800, bounceRate: 41 },
  { hour: "7p",  visitors: 1050, pageviews: 3100, sessions: 1550, bounceRate: 43 },
  { hour: "8p",  visitors: 900,  pageviews: 2700, sessions: 1350, bounceRate: 45 },
  { hour: "9p",  visitors: 750,  pageviews: 2200, sessions: 1100, bounceRate: 47 },
  { hour: "10p", visitors: 550,  pageviews: 1600, sessions: 820,  bounceRate: 50 },
  { hour: "11p", visitors: 320,  pageviews: 940,  sessions: 480,  bounceRate: 53 },
];

// Analytics Page — top pages table
export const analyticsTopPages = [
  { page: "/home",          views: 45230, unique: 31200, avgTime: "2m 45s", bounceRate: 38.2, change: 12.3 },
  { page: "/products",      views: 32150, unique: 24800, avgTime: "3m 12s", bounceRate: 42.1, change: 8.7  },
  { page: "/pricing",       views: 21420, unique: 18900, avgTime: "4m 05s", bounceRate: 31.5, change: -2.1 },
  { page: "/about",         views: 15890, unique: 13200, avgTime: "1m 58s", bounceRate: 55.8, change: 5.4  },
  { page: "/contact",       views: 12340, unique: 10100, avgTime: "2m 22s", bounceRate: 48.3, change: 15.2 },
  { page: "/blog",          views: 9870,  unique: 8650,  avgTime: "5m 30s", bounceRate: 28.7, change: 22.1 },
  { page: "/docs",          views: 7650,  unique: 6900,  avgTime: "6m 14s", bounceRate: 22.4, change: 33.5 },
  { page: "/changelog",     views: 4210,  unique: 3870,  avgTime: "3m 48s", bounceRate: 35.9, change: -8.3 },
];

// Analytics Page — top countries
export const topCountries = [
  { flag: "🇺🇸", country: "United States", visitors: 42350, pct: 32.9 },
  { flag: "🇬🇧", country: "United Kingdom", visitors: 18210, pct: 14.2 },
  { flag: "🇩🇪", country: "Germany",        visitors: 12480, pct: 9.7  },
  { flag: "🇫🇷", country: "France",         visitors: 9840,  pct: 7.6  },
  { flag: "🇯🇵", country: "Japan",          visitors: 8760,  pct: 6.8  },
  { flag: "🇨🇦", country: "Canada",         visitors: 7230,  pct: 5.6  },
  { flag: "🇦🇺", country: "Australia",      visitors: 6150,  pct: 4.8  },
  { flag: "🌍",  country: "Others",         visitors: 23523, pct: 18.4 },
];

// Analytics Page — traffic sources table
export const analyticsTrafficSources = [
  { source: "Google",     type: "Organic",  visitors: 45230, convRate: 3.2,  color: "var(--chart-1)" },
  { source: "Direct",     type: "Direct",   visitors: 28900, convRate: 4.8,  color: "var(--chart-2)" },
  { source: "Twitter",    type: "Social",   visitors: 14200, convRate: 1.9,  color: "var(--chart-3)" },
  { source: "LinkedIn",   type: "Social",   visitors: 11500, convRate: 5.1,  color: "var(--chart-4)" },
  { source: "Newsletter", type: "Email",    visitors: 8760,  convRate: 6.4,  color: "var(--chart-5)" },
  { source: "GitHub",     type: "Referral", visitors: 5320,  convRate: 2.7,  color: "var(--chart-1)" },
];

// Analytics Page — device breakdown
export const analyticsDevices = [
  { device: "Desktop", pct: 55, visitors: 70699, color: "var(--chart-1)" },
  { device: "Mobile",  pct: 35, visitors: 44990, color: "var(--chart-2)" },
  { device: "Tablet",  pct: 10, visitors: 12854, color: "var(--chart-3)" },
];

// Tracking Script
export const trackingScript = `<script>
  (function(w,d,s,l,i){
    w[l]=w[l]||[];
    w[l].push({'analytics.start': new Date().getTime(), event:'analytics.js'});
    var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
    j.async=true;
    j.src='https://analytics.example.com/track.js?id='+i+dl;
    f.parentNode.insertBefore(j,f);
  })(window,document,'script','analyticsLayer','UA-XXXXX-Y');
</script>`;
