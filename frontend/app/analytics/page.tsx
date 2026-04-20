"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { FunnelAnalysis } from "@/components/dashboard/funnel-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  kpiData,
  chartData,
  hourlyData,
  analyticsTopPages,
  topCountries,
  analyticsTrafficSources,
  analyticsDevices,
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
} from "lucide-react";
import { cn } from "@/lib/utils";

type DateRange = "7d" | "30d" | "90d";
type MetricTab = "visitors" | "pageviews" | "sessions" | "bounceRate";
type ChartView = "trend" | "hourly";
type SortKey = "views" | "bounceRate" | "avgTime";

const metricConfig: Record<MetricTab, { label: string; color: string; gradientId: string }> = {
  visitors:   { label: "Visitors",    color: "var(--teal-500)",   gradientId: "grad-visitors"   },
  pageviews:  { label: "Pageviews",   color: "var(--indigo-500)", gradientId: "grad-pageviews"  },
  sessions:   { label: "Sessions",    color: "var(--amber-500)",  gradientId: "grad-sessions"   },
  bounceRate: { label: "Bounce Rate", color: "var(--rose-500)",   gradientId: "grad-bouncerate" },
};

const typeColors: Record<string, string> = {
  Organic:  "bg-teal-500/20 text-teal-500 border-teal-500/30",
  Direct:   "bg-indigo-500/20 text-indigo-500 border-indigo-500/30",
  Social:   "bg-amber-500/20 text-amber-500 border-amber-500/30",
  Email:    "bg-rose-500/20 text-rose-500 border-rose-500/30",
  Referral: "bg-success/20 text-success border-success/30",
};

const deviceIcons = { Desktop: Monitor, Mobile: Smartphone, Tablet: Tablet };

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
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [metric, setMetric]       = useState<MetricTab>("visitors");
  const [chartView, setChartView] = useState<ChartView>("trend");
  const [sortKey, setSortKey]     = useState<SortKey>("views");

  const totalSourceVisitors = analyticsTrafficSources.reduce((s, r) => s + r.visitors, 0);

  const sortedPages = [...analyticsTopPages].sort((a, b) => {
    if (sortKey === "views")      return b.views - a.views;
    if (sortKey === "bounceRate") return a.bounceRate - b.bounceRate;
    return 0;
  });

  const { color, gradientId } = metricConfig[metric];
  const activeData = chartView === "trend" ? chartData : hourlyData;
  const xKey       = chartView === "trend" ? "date" : "hour";

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

        {/* KPI Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Visitors", value: kpiData.totalVisitors.value,
              change: kpiData.totalVisitors.change, trend: kpiData.totalVisitors.trend,
              sparkline: kpiData.totalVisitors.sparkline, icon: <Users className="h-5 w-5" />, accentColor: "teal" as const,
              prevLabel: "vs last period",
            },
            {
              title: "Page Views", value: kpiData.pageViews.value,
              change: kpiData.pageViews.change, trend: kpiData.pageViews.trend,
              sparkline: kpiData.pageViews.sparkline, icon: <Eye className="h-5 w-5" />, accentColor: "indigo" as const,
              prevLabel: "vs last period",
            },
            {
              title: "Avg. Session", value: kpiData.avgSessionDuration.value,
              change: kpiData.avgSessionDuration.change, trend: kpiData.avgSessionDuration.trend,
              sparkline: kpiData.avgSessionDuration.sparkline, icon: <Clock className="h-5 w-5" />, accentColor: "amber" as const,
              prevLabel: "vs last period",
            },
            {
              title: "Bounce Rate", value: kpiData.bounceRate.value,
              change: kpiData.bounceRate.change, trend: kpiData.bounceRate.trend,
              sparkline: kpiData.bounceRate.sparkline, icon: <MousePointerClick className="h-5 w-5" />, accentColor: "rose" as const,
              prevLabel: "vs last period",
            },
          ].map((kpi) => (
            <div key={kpi.title} className="relative">
              <KpiCard {...kpi} />
              <div className={cn(
                "absolute bottom-3 left-4 text-[10px] font-medium",
                kpi.change > 0 ? "text-success" : "text-destructive"
              )}>
                {kpi.change > 0 ? "+" : ""}{kpi.change}% {kpi.prevLabel}
              </div>
            </div>
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
            </div>
          </CardContent>
        </Card>

        {/* Top Pages + Countries */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Top Pages */}
          <Card className="bg-card border-border lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Top Pages</CardTitle>
              <div className="flex items-center gap-1">
                <span className="mr-1 text-xs text-muted-foreground">Sort:</span>
                {(["views", "bounceRate", "avgTime"] as SortKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setSortKey(k)}
                    className={cn(
                      "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                      sortKey === k
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {k === "views" ? "Views" : k === "bounceRate" ? "Bounce" : "Time"}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">#</th>
                    <th className="px-6 py-2.5 text-left text-xs font-medium text-muted-foreground">Page URL</th>
                    <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Views</th>
                    <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Unique</th>
                    <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Avg. Time</th>
                    <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Bounce %</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPages.map((row, i) => (
                    <tr key={row.page} className="border-b border-border/50 transition-colors hover:bg-secondary/50">
                      <td className="px-6 py-3 text-xs text-muted-foreground">{i + 1}</td>
                      <td className="px-6 py-3 font-mono text-xs" style={{ color: "var(--teal-500)" }}>
                        {row.page}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span>{row.views.toLocaleString()}</span>
                          {row.change > 0
                            ? <ArrowUpRight className="h-3.5 w-3.5 text-success" />
                            : <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right text-muted-foreground">{row.unique.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right text-muted-foreground">{row.avgTime}</td>
                      <td className="px-6 py-3 text-right">
                        <span className={cn(
                          "text-xs font-medium",
                          row.bounceRate < 35 ? "text-success" : row.bounceRate < 50 ? "text-warning" : "text-destructive"
                        )}>
                          {row.bounceRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Top Countries */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Top Countries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topCountries.map((c) => (
                <div key={c.country} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{c.flag}</span>
                      <span className="font-medium">{c.country}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{c.visitors.toLocaleString()}</span>
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
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Conversion Funnel */}
        <FunnelAnalysis />

        {/* Device Breakdown + Traffic Sources */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Device Breakdown */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Device Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyticsDevices.map((d) => {
                const Icon = deviceIcons[d.device as keyof typeof deviceIcons];
                return (
                  <div key={d.device} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{d.device}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{d.visitors.toLocaleString()} visitors</span>
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
                  <BarChart data={analyticsDevices} barSize={40}>
                    <XAxis dataKey="device" axisLine={false} tickLine={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                      {analyticsDevices.map((d, i) => (
                        <Cell key={i} fill={d.color} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
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
                  {analyticsTrafficSources.map((s) => (
                    <tr key={s.source} className="border-b border-border/50 transition-colors hover:bg-secondary/50">
                      <td className="px-6 py-3 font-medium">{s.source}</td>
                      <td className="px-6 py-3">
                        <Badge variant="outline" className={cn("text-xs", typeColors[s.type] ?? "")}>
                          {s.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-right">{s.visitors.toLocaleString()}</td>
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
                  {analyticsTrafficSources.map((s) => {
                    const pct = (s.visitors / totalSourceVisitors) * 100;
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
                  {analyticsTrafficSources.map((s) => (
                    <div key={s.source} className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                      <span className="text-xs text-muted-foreground">{s.source}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}
