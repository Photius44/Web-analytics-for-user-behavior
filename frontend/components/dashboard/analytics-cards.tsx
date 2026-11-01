"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { topPages, trafficSources, deviceTypes } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function TopPagesCard({ data }: { data?: { url: string; views: number }[] }) {
  const displayPages = data ? data.map(p => ({ page: p.url, views: p.views, change: 0 })) : topPages;
  const maxViews = Math.max(...displayPages.map((p) => p.views), 1);
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Top Pages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayPages.map((page, index) => {
            const pct = Math.round((page.views / maxViews) * 100);
            return (
              <div key={page.page} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{page.page}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {page.views.toLocaleString('en-US')}
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-1 text-xs font-medium",
                        page.change > 0 ? "text-success" : "text-destructive"
                      )}
                    >
                      {page.change > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(page.change)}%
                    </span>
                  </div>
                </div>
                <div className="h-1 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-1 rounded-full bg-primary/70 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function TrafficSourcesCard({ data }: { data?: { source: string; type: string; visitors: number; convRate: number; color: string }[] }) {
  const total = data ? data.reduce((acc, curr) => acc + curr.visitors, 0) : 0;
  
  const chartData = data && data.length > 0
    ? (total > 0
        ? data.filter(d => d.visitors > 0).map(d => ({
            name: d.source,
            value: Math.round((d.visitors / total) * 100),
            fill: d.color
          }))
        : [{ name: "No Data", value: 100, fill: "var(--muted)" }]
      )
    : trafficSources;

  const displayLegend = data && data.length > 0
    ? data.map(d => ({
        name: d.source,
        value: total > 0 ? Math.round((d.visitors / total) * 100) : 0,
        fill: d.color
      }))
    : trafficSources;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Traffic Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="h-40 w-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--popover-foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {displayLegend.map((source) => (
              <div key={source.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: source.fill }}
                  />
                  <span className="text-sm">{source.name}</span>
                </div>
                <span className="text-sm font-medium">{source.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const TOTAL_VISITORS = 128543;

const deviceColorMap: Record<string, string> = {
  Desktop: "var(--primary)",
  Mobile: "var(--chart-2)",
  Tablet: "var(--chart-3)",
  Unknown: "var(--muted)"
};

export function DeviceTypesCard({ data }: { data?: { type: string; count: number; percentage: number }[] }) {
  const displayDevices = data ? data.map(d => ({
    name: d.type,
    value: d.percentage,
    count: d.count,
    fill: deviceColorMap[d.type] || "var(--muted)"
  })) : deviceTypes;

  const totalVisitors = data ? data.reduce((acc, curr) => acc + curr.count, 0) : TOTAL_VISITORS;
  const displayTotal = totalVisitors >= 1000 ? `${(totalVisitors / 1000).toFixed(0)}K` : totalVisitors;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Device Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="relative h-40 w-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayDevices}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {displayDevices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--popover-foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold leading-tight">
                {displayTotal}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">visitors</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {displayDevices.map((device) => (
              <div key={device.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: device.fill }}
                  />
                  <span className="text-sm">{device.name}</span>
                </div>
                <span className="text-sm font-medium">{device.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
