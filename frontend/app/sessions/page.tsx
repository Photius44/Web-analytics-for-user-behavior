"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sessionsData } from "@/lib/mock-data";
import {
  Play,
  Search,
  Filter,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Globe,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

const deviceIcons = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
};

type FilterType = "all" | "errors" | "rageclicks" | "longsessions";

const PAGE_SIZE = 5;

const enhancedSessions = sessionsData.map((session, idx) => ({
  ...session,
  hasError: idx % 5 === 0,
  hasRageClicks: idx % 4 === 0,
  isLongSession: idx % 3 === 0,
  isLive: idx === 0,
  scrollDepth: [20, 35, 28, 42, 55, 48, 60, 75, 82],
  // Duration in seconds for color-coding
  durationSecs: idx === 0 ? 332 : idx === 1 ? 198 : idx === 2 ? 525 : idx === 3 ? 130 : idx === 4 ? 382 : idx === 5 ? 295 : idx === 6 ? 102 : 428,
  // Page path sequence for detail panel
  pathSequence: ["/home", "/products", "/pricing", "/contact"].slice(0, 2 + (idx % 3)),
}));

const filterCounts = {
  all: 24531,
  errors: 47,
  rageclicks: 12,
  longsessions: 284,
};

const filterLabels: Record<FilterType, string> = {
  all: "All",
  errors: "Errors",
  rageclicks: "Rage Clicks",
  longsessions: "Long Sessions",
};

function durationColor(secs: number) {
  if (secs >= 300) return "text-success";
  if (secs >= 120) return "text-warning";
  return "text-muted-foreground";
}

export default function SessionsPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [selectedSession, setSelectedSession] = useState<(typeof enhancedSessions)[0] | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const ids = searchParams.get("ids");
    if (ids) {
      setFilter("all"); // Reset category filter when specific IDs are provided
    }
  }, [searchParams]);

  const filteredSessions = enhancedSessions.filter((session) => {
    const idsFilter = searchParams.get("ids");
    if (idsFilter) {
      const allowedIds = idsFilter.split(",");
      return allowedIds.includes(session.id);
    }
    
    if (filter === "errors") return session.hasError;
    if (filter === "rageclicks") return session.hasRageClicks;
    if (filter === "longsessions") return session.isLongSession;
    return true;
  });

  const isFilteringByIds = !!searchParams.get("ids");
  const totalFiltered = isFilteringByIds ? filteredSessions.length : filterCounts[filter];
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);
  const pageStart = (page - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(page * PAGE_SIZE, totalFiltered);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Play className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Sessions</h1>
            <p className="text-muted-foreground">View and replay user sessions on your website.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Play, color: "text-primary", label: "Total Sessions", value: "24,531" },
            { icon: Clock, color: "text-chart-2", label: "Avg. Duration", value: "4m 32s" },
            { icon: FileText, color: "text-chart-3", label: "Avg. Pages", value: "6.8" },
            { icon: Monitor, color: "text-chart-4", label: "Desktop %", value: "62%" },
          ].map(({ icon: Icon, color, label, value }) => (
            <Card key={label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Icon className={cn("h-5 w-5", color)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Sessions Table */}
          <Card className={cn("bg-card border-border transition-all duration-300", selectedSession ? "flex-1" : "w-full")}>
            <CardHeader className="flex flex-col gap-4">
              <div className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Sessions</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search sessions..." className="pl-9 w-56 bg-secondary border-border" />
                  </div>
                  <Button variant="outline" size="icon" className="border-border">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Filter Tabs with count badges */}
              <div className="flex flex-wrap gap-2">
                {(Object.keys(filterLabels) as FilterType[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => { 
                      setFilter(id); 
                      setPage(1);
                      if (isFilteringByIds) {
                        window.history.replaceState(null, "", window.location.pathname);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      filter === id && !isFilteringByIds
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {filterLabels[id]}
                    <span className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                      filter === id && !isFilteringByIds ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {filterCounts[id].toLocaleString()}
                    </span>
                  </button>
                ))}
                {isFilteringByIds && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1 px-3 py-1.5">
                    Filtering by correlation
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => window.history.replaceState(null, "", window.location.pathname)} 
                    />
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Session ID</TableHead>
                    <TableHead className="text-muted-foreground">Duration</TableHead>
                    <TableHead className="text-muted-foreground">Pages</TableHead>
                    <TableHead className="text-muted-foreground">Device</TableHead>
                    <TableHead className="text-muted-foreground">Location</TableHead>
                    <TableHead className="text-muted-foreground">Scroll</TableHead>
                    <TableHead className="text-muted-foreground">Time</TableHead>
                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => {
                    const DeviceIcon = deviceIcons[session.device as keyof typeof deviceIcons];
                    const scrollData = session.scrollDepth.map((value, idx) => ({ idx, value }));
                    const isSelected = selectedSession?.id === session.id;
                    return (
                      <TableRow
                        key={session.id}
                        className={cn(
                          "border-border hover:bg-secondary/50 cursor-pointer transition-colors",
                          isSelected && "bg-secondary"
                        )}
                        onClick={() => setSelectedSession(isSelected ? null : session)}
                      >
                        <TableCell className="font-mono text-sm">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              {session.isLive && (
                                <span className="flex items-center gap-1 text-destructive text-[10px] font-semibold">
                                  <span className="inline-block h-2 w-2 rounded-full bg-destructive animate-pulse" />
                                  Live
                                </span>
                              )}
                              <span>{session.id}</span>
                            </div>
                            <div className="flex gap-1 flex-wrap">
                              {session.hasError && (
                                <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-[10px] px-1.5 py-0">Error</Badge>
                              )}
                              {session.hasRageClicks && (
                                <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 text-[10px] px-1.5 py-0">Rage Clicks</Badge>
                              )}
                              {session.isLongSession && (
                                <Badge className="bg-indigo-500/20 text-indigo-500 border-indigo-500/30 text-[10px] px-1.5 py-0">Long</Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={cn("flex items-center gap-2 font-medium", durationColor(session.durationSecs))}>
                            <Clock className="h-4 w-4" />
                            {session.duration}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{session.pages} pages</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DeviceIcon className="h-4 w-4" />
                            {session.device}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {session.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="h-8 w-24">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={scrollData}>
                                <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{session.timestamp}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Play className="h-3 w-3" />
                            Replay
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border px-6 py-3">
                <p className="text-sm text-muted-foreground">
                  Showing {pageStart.toLocaleString()}–{pageEnd.toLocaleString()} of {totalFiltered.toLocaleString()} sessions
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 border-border"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    {page} / {totalPages.toLocaleString()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 border-border"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detail Panel */}
          {selectedSession && (
            <Card className="bg-card border-border w-72 shrink-0 self-start transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Session Detail</CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedSession(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Session ID</p>
                  <p className="font-mono text-sm">{selectedSession.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Duration</p>
                  <p className={cn("font-semibold", durationColor(selectedSession.durationSecs))}>{selectedSession.duration}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Device &amp; Location</p>
                  <p className="text-sm">{selectedSession.device} · {selectedSession.location}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Page Path Sequence</p>
                  <div className="space-y-1">
                    {selectedSession.pathSequence.map((path, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                          {i + 1}
                        </div>
                        <div className="flex items-center gap-1.5 rounded bg-secondary px-2 py-1 font-mono text-xs">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          {path}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Button size="sm" className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Play className="h-3 w-3" />
                  Replay Session
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
