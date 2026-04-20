"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface KpiCardProps {
  title: string;
  value: string;
  change: number;
  trend: "up" | "down";
  sparkline: number[];
  icon: React.ReactNode;
  accentColor?: "teal" | "indigo" | "amber" | "rose";
}

const accentColorMap = {
  teal: {
    background: "bg-teal-500/10",
    border: "border-teal-500/20 hover:border-teal-500/50",
    text: "text-teal-500",
    chart: "var(--teal-500)",
    topBorder: "var(--teal-500)",
  },
  indigo: {
    background: "bg-indigo-500/10",
    border: "border-indigo-500/20 hover:border-indigo-500/50",
    text: "text-indigo-500",
    chart: "var(--indigo-500)",
    topBorder: "var(--indigo-500)",
  },
  amber: {
    background: "bg-amber-500/10",
    border: "border-amber-500/20 hover:border-amber-500/50",
    text: "text-amber-500",
    chart: "var(--amber-500)",
    topBorder: "var(--amber-500)",
  },
  rose: {
    background: "bg-rose-500/10",
    border: "border-rose-500/20 hover:border-rose-500/50",
    text: "text-rose-500",
    chart: "var(--rose-500)",
    topBorder: "var(--rose-500)",
  },
};

export function KpiCard({
  title,
  value,
  change,
  trend,
  sparkline,
  icon,
  accentColor,
}: KpiCardProps) {
  const isPositive = trend === "up" ? change > 0 : change < 0;
  const chartData = sparkline.map((value, index) => ({ value, index }));
  const accentStyles = accentColor ? accentColorMap[accentColor] : null;

  return (
    <Card
      className={cn(
        "bg-card border-border transition-all duration-300 overflow-hidden",
        accentStyles ? accentStyles.border : "hover:border-primary/50"
      )}
      style={accentStyles ? { borderTop: `2px solid ${accentStyles.topBorder}` } : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={accentStyles ? accentStyles.text : "text-muted-foreground"}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-3xl font-bold text-foreground">{value}</p>
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                isPositive ? "text-success" : "text-destructive"
              )}
            >
              {trend === "up" ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>
                {Math.abs(change)}% {isPositive ? "increase" : "decrease"}
              </span>
            </div>
          </div>
          <div className="h-12 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={accentStyles ? accentStyles.chart : (isPositive ? "var(--success)" : "var(--destructive)")}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor={accentStyles ? accentStyles.chart : (isPositive ? "var(--success)" : "var(--destructive)")}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={accentStyles ? accentStyles.chart : (isPositive ? "var(--success)" : "var(--destructive)")}
                  strokeWidth={2}
                  fill={`url(#gradient-${title})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
