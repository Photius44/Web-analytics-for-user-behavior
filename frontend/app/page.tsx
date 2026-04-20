import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MainChart } from "@/components/dashboard/main-chart";
import {
  TopPagesCard,
  TrafficSourcesCard,
  DeviceTypesCard,
} from "@/components/dashboard/analytics-cards";
import { kpiData } from "@/lib/mock-data";
import { Users, Eye, Clock, MousePointerClick, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your analytics.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Visitors"
            value={kpiData.totalVisitors.value}
            change={kpiData.totalVisitors.change}
            trend={kpiData.totalVisitors.trend}
            sparkline={kpiData.totalVisitors.sparkline}
            icon={<Users className="h-5 w-5" />}
            accentColor="teal"
          />
          <KpiCard
            title="Page Views"
            value={kpiData.pageViews.value}
            change={kpiData.pageViews.change}
            trend={kpiData.pageViews.trend}
            sparkline={kpiData.pageViews.sparkline}
            icon={<Eye className="h-5 w-5" />}
            accentColor="indigo"
          />
          <KpiCard
            title="Avg. Session Duration"
            value={kpiData.avgSessionDuration.value}
            change={kpiData.avgSessionDuration.change}
            trend={kpiData.avgSessionDuration.trend}
            sparkline={kpiData.avgSessionDuration.sparkline}
            icon={<Clock className="h-5 w-5" />}
            accentColor="amber"
          />
          <div className="relative group">
            <KpiCard
              title="Bounce Rate"
              value={kpiData.bounceRate.value}
              change={kpiData.bounceRate.change}
              trend={kpiData.bounceRate.trend}
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
        <MainChart />

        {/* Secondary Analytics */}
        <div className="grid gap-4 md:grid-cols-3">
          <TopPagesCard />
          <TrafficSourcesCard />
          <DeviceTypesCard />
        </div>
      </div>
    </DashboardLayout>
  );
}
