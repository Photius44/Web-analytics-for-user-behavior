"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Area,
  AreaChart,
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartData } from "@/lib/mock-data";
import { TrendingUp, TrendingDown } from "lucide-react";

// Compute simple period-over-period % change for each data point
function getPctChange(data: typeof chartData, key: ChartType, index: number): number | null {
  if (index === 0) return null;
  const prev = data[index - 1][key] as number;
  const curr = data[index][key] as number;
  if (prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 100);
}

function CustomTooltip({
  active,
  payload,
  label,
  activeChart,
  chartDataRef,
}: {
  active?: boolean;
  payload?: { value: number; dataIndex?: number }[];
  label?: string;
  activeChart: ChartType;
  chartDataRef: typeof chartData;
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  const index = chartDataRef.findIndex((d) => d.date === label);
  const pct = index >= 0 ? getPctChange(chartDataRef, activeChart, index) : null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2.5 shadow-lg min-w-[160px]">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">
        {value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}
      </p>
      {pct !== null && (
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${pct >= 0 ? "text-success" : "text-destructive"}`}>
          {pct >= 0
            ? <TrendingUp className="h-3 w-3" />
            : <TrendingDown className="h-3 w-3" />}
          <span>{pct >= 0 ? "+" : ""}{pct}% vs prev day</span>
        </div>
      )}
    </div>
  );
}

type ChartType = "visitors" | "pageviews" | "sessions";
type ChartViewType = "line" | "bar";

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "var(--chart-1)",
  },
  pageviews: {
    label: "Page Views",
    color: "var(--chart-2)",
  },
  sessions: {
    label: "Sessions",
    color: "var(--chart-3)",
  },
};

export function MainChart() {
  const [activeChart, setActiveChart] = useState<ChartType>("visitors");
  const [chartView, setChartView] = useState<ChartViewType>("line");

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-2">
          <CardTitle className="text-lg font-semibold">Overview</CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setChartView("line")}
              className={`text-xs px-3 py-1 rounded transition-colors ${
                chartView === "line"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartView("bar")}
              className={`text-xs px-3 py-1 rounded transition-colors ${
                chartView === "bar"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Bar
            </button>
          </div>
        </div>
        <Tabs
          value={activeChart}
          onValueChange={(v) => setActiveChart(v as ChartType)}
        >
          <TabsList className="bg-secondary">
            <TabsTrigger value="visitors">Visitors</TabsTrigger>
            <TabsTrigger value="pageviews">Pageviews</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === "line" ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={chartConfig[activeChart].color}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor={chartConfig[activeChart].color}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickFormatter={(value) =>
                    value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value
                  }
                />
                <Tooltip
                  content={<CustomTooltip activeChart={activeChart} chartDataRef={chartData} />}
                />
                <Area
                  type="monotone"
                  dataKey={activeChart}
                  stroke={chartConfig[activeChart].color}
                  strokeWidth={2}
                  fill="url(#chartGradient)"
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={chartConfig[activeChart].color}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="100%"
                      stopColor={chartConfig[activeChart].color}
                      stopOpacity={0.4}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickFormatter={(value) =>
                    value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value
                  }
                />
                <Tooltip
                  content={<CustomTooltip activeChart={activeChart} chartDataRef={chartData} />}
                />
                <Bar
                  dataKey={activeChart}
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
