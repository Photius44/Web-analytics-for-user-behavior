"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { FunnelAnalysis } from "@/components/dashboard/funnel-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  hourlyData,
} from "@/lib/mock-data";
import {
  Users,
  Eye,
  Clock,
  MousePointerClick,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Monitor,
  Smartphone,
  Tablet,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProject } from "@/context/ProjectContext";
import { useAnalytics } from "@/hooks/useAnalytics";

type DateRange = "7d" | "30d" | "90d";
type MetricTab = "visitors" | "pageviews" | "sessions";
type ChartView = "trend" | "hourly";
type SortKey = "views";

const metricConfig: Record<MetricTab, { label: string; color: string; gradientId: string }> = {
  visitors:  { label: "Visitors",  color: "var(--teal-500)",   gradientId: "grad-visitors"  },
  pageviews: { label: "Pageviews", color: "var(--indigo-500)", gradientId: "grad-pageviews" },
  sessions:  { label: "Sessions",  color: "var(--amber-500)",  gradientId: "grad-sessions"  },
};

const typeColors: Record<string, string> = {
  Organic:  "bg-teal-500/20 text-teal-500 border-teal-500/30",
  Direct:   "bg-indigo-500/20 text-indigo-500 border-indigo-500/30",
  Social:   "bg-amber-500/20 text-amber-500 border-amber-500/30",
  Email:    "bg-rose-500/20 text-rose-500 border-rose-500/30",
  Referral: "bg-success/20 text-success border-success/30",
};

const deviceIconMap = { Desktop: Monitor, Mobile: Smartphone, Tablet: Tablet };
const deviceColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold text-foreground">
          {p.value >= 1000 ? `${(p.value / 1000).toFixed(1)}K` : p.value}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("7d");
  const [metric, setMetric]       = useState<MetricTab>("visitors");
  const [chartView, setChartView] = useState<ChartView>("trend");
  const [sortKey, setSortKey]     = useState<SortKey>("views");

  const { selectedProject } = useProject();
  const projectId = selectedProject?.id ?? "";
  const { data, isLoading, error } = useAnalytics(projectId, dateRange);

  // Fetch previous period (double the range) to compute real trend percentages
  const prevRange = dateRange === "7d" ? "14d" : dateRange === "30d" ? "60d" : "180d";
  const { data: prevData } = useAnalytics(projectId, prevRange);

  /**
   * Safe trend percentage: ((current - previous) / previous) * 100
   * Returns null when previous === 0 to indicate "New Project" (no baseline).
   */
  function calcTrend(current: number, previous: number | undefined): number | "FIRST_PERIOD" | null {
    if (previous === undefined) {
      if (current > 0) return "FIRST_PERIOD";
      return null;
    }
    if (previous === 0) {
      if (current === 0) return 0;
      return "FIRST_PERIOD";
    }
    return ((current - previous) / previous) * 100;
  }

  const liveTrafficSources = data?.trafficSources ?? [];
  const totalSourceVisitors = liveTrafficSources.reduce((s, r) => s + r.visitors, 0);

  // Top Pages from real API data, sorted by views
  const liveTopPages = (data?.topPages ?? []).map((p) => ({
    page: p.url,
    views: p.views,
    unique: Math.round(p.views * 0.78),
    avgTime: "—",
    bounceRate: 0,
    change: 0,
  }));

  // Device breakdown from real API
  const liveDevices = (data?.deviceTypes ?? []).map((d, i) => ({
    device: d.type,
    pct: d.percentage,
    visitors: d.count,
    color: deviceColors[i % deviceColors.length],
  }));

  // Chart data from API (trend) or static hourly
  const trendChartData = data?.chartData ?? [];
  const activeData = chartView === "trend" ? trendChartData : hourlyData;
  const xKey       = chartView === "trend" ? "date" : "hour";

  const { color, gradientId } = metricConfig[metric];

  // KPI values — live or skeleton
  const kpiValues = {
    totalVisitors: data?.kpis.totalVisitors ?? 0,
    pageViews: data?.kpis.pageViews ?? 0,
    avgSessionDuration: data?.kpis.avgSessionDuration ?? "—",
    bounceRate: data?.kpis.bounceRate ?? "—",
  };

  // Trend calculations — null means no previous data (new project)
  const visitorsTrend   = calcTrend(kpiValues.totalVisitors, prevData?.kpis.totalVisitors);
  const pageViewsTrend  = calcTrend(kpiValues.pageViews,     prevData?.kpis.pageViews);
  const bounceRateNum   = parseFloat((kpiValues.bounceRate as string).replace("%", "")) || 0;
  const prevBounceNum   = parseFloat((prevData?.kpis.bounceRate ?? "0").replace("%", "")) || 0;
  const bounceRateTrend = calcTrend(bounceRateNum, prevBounceNum);

  const visitorsChange = visitorsTrend === "FIRST_PERIOD" ? 100 : Math.abs(visitorsTrend ?? 0);
  const visitorsTrendVal = visitorsTrend === "FIRST_PERIOD" ? ("FIRST_PERIOD" as const) : (visitorsTrend ?? 0) >= 0 ? ("up" as const) : ("down" as const);

  const pageViewsChange = pageViewsTrend === "FIRST_PERIOD" ? 100 : Math.abs(pageViewsTrend ?? 0);
  const pageViewsTrendVal = pageViewsTrend === "FIRST_PERIOD" ? ("FIRST_PERIOD" as const) : (pageViewsTrend ?? 0) >= 0 ? ("up" as const) : ("down" as const);

  const bounceRateChange = bounceRateTrend === "FIRST_PERIOD" ? 100 : Math.abs(bounceRateTrend ?? 0);
  const bounceRateTrendVal = bounceRateTrend === "FIRST_PERIOD" ? ("FIRST_PERIOD" as const) : (bounceRateTrend ?? 0) <= 0 ? ("up" as const) : ("down" as const);

  // Top Countries — aggregate from real topPages location data (future-proof)
  // The API currently doesn't expose per-country data, so we check if live data
  // has any country info. If not, show a single "Unknown Location" row that
  // accounts for 100% of the actual pageview total.
  const liveCountries: { label: string; flag: string; visitors: number; pct: number }[] = (() => {
    const total = kpiValues.pageViews;
    if (total === 0) return [];
    // Placeholder for when backend adds a `topCountries` field to the response
    const rawCountries = (data as any)?.topCountries as
      | { country: string; flag?: string; visitors: number }[]
      | undefined;
    if (rawCountries && rawCountries.length > 0) {
      return rawCountries.map((c) => ({
        label: c.country,
        flag: c.flag ?? "🌍",
        visitors: c.visitors,
        pct: total > 0 ? Math.round((c.visitors / total) * 100) : 0,
      }));
    }
    // Fallback: backend has no country data yet — show one accurate row
    return [{ label: "Unknown Location", flag: "🌍", visitors: total, pct: 100 }];
  })();

  const hasNoData = !isLoading && !error && kpiValues.totalVisitors === 0 && kpiValues.pageViews === 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Deep dive into your traffic and engagement data
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden rounded-lg border border-border">
              {(["7d", "30d", "90d"] as DateRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-colors",
                    dateRange === r
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  {r === "7d" ? "Last 7 days" : r === "30d" ? "30 days" : "90 days"}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 border-border">
              <Filter className="h-3.5 w-3.5" />
              Filter
            </Button>
            <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        </div>

        {/* Offline Error Banner */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <span className="font-semibold">Backend Server Offline:</span> Failed to fetch live analytics from http://localhost:5000. Displaying fallback mock data.
            </div>
          </div>
        )}

        {hasNoData ? (
          <EmptyState projectId={projectId} domain={selectedProject?.domain ?? "localhost"} />
        ) : (
          <>
            {/* KPI Row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Total Visitors",
                  value: isLoading && !error
                    ? <Skeleton className="h-8 w-24 bg-muted-foreground/10" />
                    : kpiValues.totalVisitors.toLocaleString("en-US"),
                  icon: <Users className="h-5 w-5" />,
                  accentColor: "teal" as const,
                  change: visitorsChange,
                  trend: visitorsTrendVal,
                  isNewProject: visitorsTrend === null,
                  sparkline: [30, 40, 35, 50, 49, 60, 70, 91, 85, 95],
                },
                {
                  title: "Page Views",
                  value: isLoading && !error
                    ? <Skeleton className="h-8 w-24 bg-muted-foreground/10" />
                    : kpiValues.pageViews.toLocaleString("en-US"),
                  icon: <Eye className="h-5 w-5" />,
                  accentColor: "indigo" as const,
                  change: pageViewsChange,
                  trend: pageViewsTrendVal,
                  isNewProject: pageViewsTrend === null,
                  sparkline: [20, 35, 45, 40, 55, 65, 60, 75, 80, 85],
                },
                {
                  title: "Avg. Session",
                  value: isLoading && !error
                    ? <Skeleton className="h-8 w-24 bg-muted-foreground/10" />
                    : kpiValues.avgSessionDuration,
                  icon: <Clock className="h-5 w-5" />,
                  accentColor: "amber" as const,
                  change: 0,
                  trend: "up" as const,
                  isNewProject: visitorsTrend === null,
                  sparkline: [50, 45, 48, 42, 40, 38, 35, 38, 36, 35],
                },
                {
                  title: "Bounce Rate",
                  value: isLoading && !error
                    ? <Skeleton className="h-8 w-24 bg-muted-foreground/10" />
                    : kpiValues.bounceRate,
                  icon: <MousePointerClick className="h-5 w-5" />,
                  accentColor: "rose" as const,
                  change: bounceRateChange,
                  trend: bounceRateTrendVal,
                  isNewProject: bounceRateTrend === null,
                  sparkline: [55, 52, 50, 48, 45, 44, 42, 43, 41, 38],
                },
              ].map((kpi) => (
                <KpiCard key={kpi.title} {...kpi} />
              ))}
            </div>

            {/* Main Chart */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1">
                  {(Object.keys(metricConfig) as MetricTab[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMetric(m)}
                      className={cn(
                        "rounded px-3 py-1.5 text-xs font-medium transition-colors",
                        metric === m
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {metricConfig[m].label}
                    </button>
                  ))}
                </div>
                <div className="flex overflow-hidden rounded-lg border border-border self-start">
                  {(["trend", "hourly"] as ChartView[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => setChartView(v)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium transition-colors",
                        chartView === v
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {v === "trend" ? "Trend" : "By Hour"}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-72 transition-all duration-300 ease-in-out">
                  {isLoading && !error ? (
                    <Skeleton className="h-full w-full rounded-lg bg-muted-foreground/10" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      {chartView === "trend" ? (
                        <AreaChart data={activeData}>
                          <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%"   stopColor={color} stopOpacity={0.4} />
                              <stop offset="100%" stopColor={color} stopOpacity={0}   />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                          <XAxis dataKey={xKey} axisLine={false} tickLine={false}
                            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                          <YAxis axisLine={false} tickLine={false}
                            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey={metric} stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} />
                        </AreaChart>
                      ) : (
                        <BarChart data={activeData}>
                          <defs>
                            <linearGradient id={`${gradientId}-bar`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%"   stopColor={color} stopOpacity={0.9} />
                              <stop offset="100%" stopColor={color} stopOpacity={0.4} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                          <XAxis dataKey={xKey} axisLine={false} tickLine={false}
                            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                          <YAxis axisLine={false} tickLine={false}
                            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey={metric} fill={`url(#${gradientId}-bar)`} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Pages + Countries */}
            <div className="grid gap-6 lg:grid-cols-3">

              {/* Top Pages — real data from API */}
              <Card className="bg-card border-border lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-semibold">Top Pages</CardTitle>
                  <span className="text-xs text-muted-foreground">by views</span>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading && !error ? (
                    <div className="space-y-3 p-6">
                      {[1,2,3,4,5].map((i) => (
                        <Skeleton key={i} className="h-8 w-full rounded bg-muted-foreground/10" />
                      ))}
                    </div>
                  ) : liveTopPages.length === 0 ? (
                    <p className="px-6 py-8 text-sm text-center text-muted-foreground">
                      No page view data found for this project in the selected date range.
                    </p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">#</th>
                          <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Page URL</th>
                          <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Views</th>
                          <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Unique (est.)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {liveTopPages.map((row, i) => (
                          <tr key={row.page} className="border-b border-border/50 transition-colors hover:bg-secondary/50">
                            <td className="px-6 py-3 text-xs text-muted-foreground">{i + 1}</td>
                            <td className="px-6 py-3 font-mono text-xs" style={{ color: "var(--teal-500)" }}>
                              {row.page}
                            </td>
                            <td className="px-6 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span>{row.views.toLocaleString("en-US")}</span>
                                <ArrowUpRight className="h-3.5 w-3.5 text-success" />
                              </div>
                            </td>
                            <td className="px-6 py-3 text-right text-muted-foreground">{row.unique.toLocaleString("en-US")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              {/* Top Countries — live aggregation */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Top Countries</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoading && !error ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-8 w-full rounded bg-muted-foreground/10" />
                      ))}
                    </div>
                  ) : liveCountries.length === 0 ? (
                    <p className="text-sm text-center text-muted-foreground py-4">
                      No location data available yet.
                    </p>
                  ) : (
                    liveCountries.map((c) => (
                      <div key={c.label} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-base leading-none">{c.flag}</span>
                            <span className="font-medium">{c.label}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{c.visitors.toLocaleString("en-US")}</span>
                            <span className="font-semibold text-foreground">{c.pct}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-secondary">
                          <div
                            className="h-1.5 rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${c.pct}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                  <p className="text-[10px] text-muted-foreground pt-1">
                    * Aggregated from tracked page-view events. Geo-IP lookup coming soon.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Conversion Funnel */}
            <FunnelAnalysis data={data?.funnel} />

            {/* Device Breakdown + Traffic Sources */}
            <div className="grid gap-6 lg:grid-cols-2">

              {/* Device Breakdown — live from API */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Device Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading && !error ? (
                    <div className="space-y-3">
                      {[1,2,3].map((i) => <Skeleton key={i} className="h-8 w-full rounded bg-muted-foreground/10" />)}
                    </div>
                  ) : liveDevices.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No device data available.</p>
                  ) : (
                    <>
                      {liveDevices.map((d, idx) => {
                        const Icon = deviceIconMap[d.device as keyof typeof deviceIconMap] ?? Monitor;
                        return (
                          <div key={d.device} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{d.device}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{d.visitors.toLocaleString("en-US")} sessions</span>
                                <span className="text-base font-semibold text-foreground">{d.pct}%</span>
                              </div>
                            </div>
                            <div className="h-2 w-full rounded-full bg-secondary">
                              <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{ width: `${d.pct}%`, background: d.color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      <div className="mt-2 h-24">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={liveDevices} barSize={40}>
                            <XAxis dataKey="device" axisLine={false} tickLine={false}
                              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                              {liveDevices.map((d, i) => (
                                <Cell key={i} fill={d.color} fillOpacity={0.85} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Traffic Sources — dynamic from backend */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Traffic Sources</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {liveTrafficSources.length === 0 ? (
                    <p className="px-6 py-8 text-sm text-center text-muted-foreground">
                      No traffic source data recorded yet.
                    </p>
                  ) : (
                    <>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Source</th>
                            <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Type</th>
                            <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Visitors</th>
                            <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Conv. Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {liveTrafficSources.map((s) => (
                            <tr key={s.source} className="border-b border-border/50 transition-colors hover:bg-secondary/50">
                              <td className="px-6 py-3 font-medium">{s.source}</td>
                              <td className="px-6 py-3">
                                <Badge variant="outline" className={cn("text-xs", typeColors[s.type] ?? "")}>
                                  {s.type}
                                </Badge>
                              </td>
                              <td className="px-6 py-3 text-right">{s.visitors.toLocaleString("en-US")}</td>
                              <td className="px-6 py-3 text-right">
                                <span className={cn(
                                  "text-xs font-semibold",
                                  s.convRate >= 5 ? "text-success" : s.convRate >= 3 ? "text-warning" : "text-muted-foreground"
                                )}>
                                  {s.convRate}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="px-6 py-4 space-y-2">
                        <p className="text-xs text-muted-foreground">Distribution</p>
                        <div className="flex h-3 w-full overflow-hidden rounded-full">
                          {liveTrafficSources.map((s) => {
                            const pct = totalSourceVisitors > 0 ? (s.visitors / totalSourceVisitors) * 100 : 0;
                            return (
                              <div
                                key={s.source}
                                className="h-full transition-all duration-500"
                                style={{ width: `${pct}%`, background: s.color }}
                                title={`${s.source}: ${pct.toFixed(1)}%`}
                              />
                            );
                          })}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                          {liveTrafficSources.map((s) => (
                            <div key={s.source} className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                              <span className="text-xs text-muted-foreground">{s.source}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
}
