"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MainChart } from "@/components/dashboard/main-chart";
import {
  TopPagesCard,
  TrafficSourcesCard,
  DeviceTypesCard,
} from "@/components/dashboard/analytics-cards";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useProject } from "@/context/ProjectContext";
import { kpiData } from "@/lib/mock-data";
import { Users, Eye, Clock, MousePointerClick, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function DashboardPage() {
  const [range, setRange] = useState<string>("7d");
  const { selectedProject } = useProject();
  const projectId = selectedProject?.id ?? "";
  
  const { data, isLoading, error } = useAnalytics(projectId, range);
  const kpis = data?.kpis;

  // Fetch the previous period (double the range) to compute real trend %
  const prevRange = range === "7d" ? "14d" : range === "30d" ? "60d" : "180d";
  const { data: prevData } = useAnalytics(projectId, prevRange);

  /**
   * Safe trend percentage. Returns null when no previous baseline (new project).
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

  const visitorsTrend  = calcTrend(kpis?.totalVisitors ?? 0, prevData?.kpis.totalVisitors);
  const pageViewsTrend = calcTrend(kpis?.pageViews ?? 0,     prevData?.kpis.pageViews);
  const bounceRateNum  = parseFloat((kpis?.bounceRate ?? "0").replace("%", "")) || 0;
  const prevBounceNum  = parseFloat((prevData?.kpis.bounceRate ?? "0").replace("%", "")) || 0;
  const bounceRateTrend = calcTrend(bounceRateNum, prevBounceNum);
  const isNewProject   = visitorsTrend === null;

  const visitorsChange = visitorsTrend === "FIRST_PERIOD" ? 100 : Math.abs(visitorsTrend ?? 0);
  const visitorsTrendVal = visitorsTrend === "FIRST_PERIOD" ? "FIRST_PERIOD" : (visitorsTrend ?? 0) >= 0 ? "up" : "down";

  const pageViewsChange = pageViewsTrend === "FIRST_PERIOD" ? 100 : Math.abs(pageViewsTrend ?? 0);
  const pageViewsTrendVal = pageViewsTrend === "FIRST_PERIOD" ? "FIRST_PERIOD" : (pageViewsTrend ?? 0) >= 0 ? "up" : "down";

  const bounceRateChange = bounceRateTrend === "FIRST_PERIOD" ? 100 : Math.abs(bounceRateTrend ?? 0);
  const bounceRateTrendVal = bounceRateTrend === "FIRST_PERIOD" ? "FIRST_PERIOD" : (bounceRateTrend ?? 0) <= 0 ? "up" : "down";
  
  const hasNoData = !isLoading && !error && kpis && kpis.totalVisitors === 0 && kpis.pageViews === 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here&apos;s an overview of your analytics.
            </p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex overflow-hidden rounded-lg border border-border self-start">
            {(["7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  range === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {r === "7d" ? "Last 7 days" : r === "30d" ? "30 days" : "90 days"}
              </button>
            ))}
          </div>
        </div>

        {/* Error Warning Banner */}
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
            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title="Total Visitors"
                value={
                  isLoading && !error ? (
                    <Skeleton className="h-8 w-24 bg-muted-foreground/10" />
                  ) : error ? (
                    kpiData.totalVisitors.value
                  ) : (
                    kpis?.totalVisitors.toLocaleString('en-US') || "0"
                  )
                }
                change={error ? kpiData.totalVisitors.change : visitorsChange}
                trend={error ? kpiData.totalVisitors.trend : visitorsTrendVal}
                isNewProject={!error && isNewProject}
                sparkline={kpiData.totalVisitors.sparkline}
                icon={<Users className="h-5 w-5" />}
                accentColor="teal"
              />
              <KpiCard
                title="Page Views"
                value={
                  isLoading && !error ? (
                    <Skeleton className="h-8 w-24 bg-muted-foreground/10" />
                  ) : error ? (
                    kpiData.pageViews.value
                  ) : (
                    kpis?.pageViews.toLocaleString('en-US') || "0"
                  )
                }
                change={error ? kpiData.pageViews.change : pageViewsChange}
                trend={error ? kpiData.pageViews.trend : pageViewsTrendVal}
                isNewProject={!error && isNewProject}
                sparkline={kpiData.pageViews.sparkline}
                icon={<Eye className="h-5 w-5" />}
                accentColor="indigo"
              />
              <KpiCard
                title="Avg. Session Duration"
                value={
                  isLoading && !error ? (
                    <Skeleton className="h-8 w-24 bg-muted-foreground/10" />
                  ) : error ? (
                    kpiData.avgSessionDuration.value
                  ) : (
                    kpis?.avgSessionDuration || "0s"
                  )
                }
                change={error ? kpiData.avgSessionDuration.change : 0}
                trend={error ? kpiData.avgSessionDuration.trend : "up"}
                isNewProject={!error && isNewProject}
                sparkline={kpiData.avgSessionDuration.sparkline}
                icon={<Clock className="h-5 w-5" />}
                accentColor="amber"
              />
              <div className="relative group">
                <KpiCard
                  title="Bounce Rate"
                  value={
                    isLoading && !error ? (
                      <Skeleton className="h-8 w-24 bg-muted-foreground/10" />
                    ) : error ? (
                      kpiData.bounceRate.value
                    ) : (
                      kpis?.bounceRate || "0.0%"
                    )
                  }
                  change={error ? kpiData.bounceRate.change : bounceRateChange}
                  trend={error ? kpiData.bounceRate.trend : bounceRateTrendVal}
                  isNewProject={!error && isNewProject}
                  sparkline={kpiData.bounceRate.sparkline}
                  icon={<MousePointerClick className="h-5 w-5" />}
                  accentColor="rose"
                />
                <Link 
                  href="/ai-insights" 
                  className="absolute bottom-3 right-4 flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  Review UX Suggestion
                  <ArrowRight className="h-2.5 w-2.5" />
                </Link>
              </div>
            </div>

            {/* Main Chart */}
            <MainChart data={error ? undefined : data?.chartData} />

            {/* Secondary Analytics */}
            <div className="grid gap-4 md:grid-cols-3">
              <TopPagesCard data={error ? undefined : data?.topPages} />
              <TrafficSourcesCard data={error ? undefined : data?.trafficSources} />
              <DeviceTypesCard data={error ? undefined : data?.deviceTypes} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
