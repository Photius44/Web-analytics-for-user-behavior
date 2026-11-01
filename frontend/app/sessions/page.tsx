"use client";

import { useState, useEffect, Suspense } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useSearchParams } from "next/navigation";
import { useProject } from "@/context/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  AlertTriangle,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

const deviceIcons = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
};

type FilterType = "all" | "bounce" | "rage_click";
const PAGE_SIZE = 10;

const filterLabels: Record<FilterType, string> = {
  all: "All Sessions",
  bounce: "Bounces",
  rage_click: "Rage Clicks",
};

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function durationColor(secs: number) {
  if (secs >= 300) return "text-success";
  if (secs >= 120) return "text-warning";
  return "text-muted-foreground";
}

interface LiveSession {
  id: string;
  visitorId: string;
  browser: string;
  os: string;
  deviceType: string;
  durationSeconds: number;
  startedAt: string;
  eventCount: number;
}

interface DisplaySession {
  id: string;
  visitorId: string;
  deviceType: string;
  duration: string;
  durationSecs: number;
  pages: number;
  location: string;
  timestamp: string;
  hasRageClicks: boolean;
  isLongSession: boolean;
  isLive: boolean;
  scrollDepth: number[];
  pathSequence: string[];
  browser: string;
  os: string;
}

function mapSession(s: LiveSession, idx: number): DisplaySession {
  const startDate = new Date(s.startedAt);
  const now = Date.now();
  const timestampStr =
    startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
    " · " +
    startDate.toLocaleDateString();

  return {
    id: s.id,
    visitorId: s.visitorId,
    browser: s.browser || "Unknown",
    os: s.os || "Unknown",
    deviceType: s.deviceType || "Desktop",
    duration: formatDuration(s.durationSeconds),
    durationSecs: s.durationSeconds,
    pages: s.eventCount || 1,
    location: "—",
    timestamp: timestampStr,
    hasRageClicks: s.eventCount >= 5,
    isLongSession: s.durationSeconds >= 300,
    isLive: idx === 0 && now - startDate.getTime() < 300_000,
    scrollDepth: [20, 35, 50, 45, 60, 70, 80],
    pathSequence: ["/home", "/pricing", "/products"].slice(0, Math.min(3, s.eventCount)),
  };
}

// Fallback mock for offline state
const MOCK_SESSIONS: DisplaySession[] = [
  { id: "sess_001", visitorId: "v-abc", browser: "Chrome", os: "Windows", deviceType: "Desktop", duration: "5m 32s", durationSecs: 332, pages: 8, location: "New York, US", timestamp: "2 min ago", hasRageClicks: false, isLongSession: true, isLive: true, scrollDepth: [20,35,28,42,55,48,60,75,82], pathSequence: ["/home","/products","/pricing"] },
  { id: "sess_002", visitorId: "v-def", browser: "Safari", os: "macOS", deviceType: "Mobile", duration: "3m 18s", durationSecs: 198, pages: 4, location: "London, UK", timestamp: "5 min ago", hasRageClicks: false, isLongSession: false, isLive: false, scrollDepth: [10,20,35,50,60], pathSequence: ["/home","/pricing"] },
  { id: "sess_003", visitorId: "v-ghi", browser: "Firefox", os: "Linux", deviceType: "Desktop", duration: "8m 45s", durationSecs: 525, pages: 12, location: "Tokyo, JP", timestamp: "8 min ago", hasRageClicks: true, isLongSession: true, isLive: false, scrollDepth: [30,50,65,80,90,95], pathSequence: ["/home","/products","/pricing"] },
];

function SessionsList() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");

  const [filter, setFilter] = useState<FilterType>(
    (filterParam as FilterType) || "all"
  );
  const [page, setPage] = useState(1);
  const [selectedSession, setSelectedSession] = useState<DisplaySession | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [sessions, setSessions] = useState<DisplaySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live summary stats from API
  const [stats, setStats] = useState({ total: 0, avgDuration: "—", avgPages: "—", desktopPct: "—" });

  const { selectedProject } = useProject();
  const projectId = selectedProject?.id ?? "";

  useEffect(() => {
    if (filterParam) setFilter(filterParam as FilterType);
  }, [filterParam]);

  useEffect(() => {
    if (!projectId) { setLoading(true); return; }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const apiFilterType =
      filter === "bounce" ? "bounce" :
      filter === "rage_click" ? "rage_click" : "";

    const fetchUrl = `http://localhost:5000/api/analytics/sessions?projectId=${projectId}&filterType=${apiFilterType}`;

    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load sessions (HTTP ${res.status})`);
        return res.json();
      })
      .then((json) => {
        if (!isMounted) return;
        if (json.success) {
          const mapped: DisplaySession[] = json.data.map(mapSession);
          setSessions(mapped);

          // Compute summary stats
          const total = mapped.length;
          const totalDurSecs = mapped.reduce((a, s) => a + s.durationSecs, 0);
          const avgDurSecs = total > 0 ? Math.round(totalDurSecs / total) : 0;
          const avgPages = total > 0 ? (mapped.reduce((a, s) => a + s.pages, 0) / total).toFixed(1) : "—";
          const desktopCount = mapped.filter(s => s.deviceType === "Desktop").length;
          const desktopPct = total > 0 ? `${Math.round((desktopCount / total) * 100)}%` : "—";

          setStats({
            total,
            avgDuration: formatDuration(avgDurSecs),
            avgPages,
            desktopPct,
          });
        } else {
          throw new Error(json.error || "Failed to fetch sessions");
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("[Sessions fetch error]:", err);
        setError(err.message);
        setSessions(MOCK_SESSIONS);
        setLoading(false);
      });

    return () => { isMounted = false; };
  }, [filter, projectId]);

  // Filter by search term
  const searched = sessions.filter((s) => {
    if (!searchTerm) return true;
    return (
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.visitorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.deviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.browser.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalFiltered = searched.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const pageStart = totalFiltered > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const pageEnd = Math.min(page * PAGE_SIZE, totalFiltered);
  const paginated = searched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

        {/* Offline Banner */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <span className="font-semibold">Backend Server Offline:</span>{" "}
              Failed to fetch live sessions. Displaying fallback mock data.
            </div>
          </div>
        )}

        {/* Stats Cards — live computed from API results */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Play, color: "text-primary", label: "Total Sessions", value: loading ? null : stats.total.toLocaleString("en-US") },
            { icon: Clock, color: "text-chart-2", label: "Avg. Duration", value: loading ? null : stats.avgDuration },
            { icon: FileText, color: "text-chart-3", label: "Avg. Pages", value: loading ? null : stats.avgPages },
            { icon: Monitor, color: "text-chart-4", label: "Desktop %", value: loading ? null : stats.desktopPct },
          ].map(({ icon: Icon, color, label, value }) => (
            <Card key={label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Icon className={cn("h-5 w-5", color)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    {value === null ? (
                      <Skeleton className="h-7 w-20 mt-1 bg-muted-foreground/10" />
                    ) : (
                      <p className="text-2xl font-bold">{value}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Sessions Table */}
          <Card className={cn("bg-card border-border transition-all duration-300 relative", selectedSession ? "flex-1" : "w-full")}>
            {loading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-lg">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            )}

            <CardHeader className="flex flex-col gap-4">
              <div className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Recent Sessions
                  {!loading && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({totalFiltered.toLocaleString("en-US")})
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search sessions..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                      className="pl-9 w-56 bg-secondary border-border"
                    />
                  </div>
                  <Button variant="outline" size="icon" className="border-border">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                {(Object.keys(filterLabels) as FilterType[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => {
                      setFilter(id);
                      setPage(1);
                      const url = new URL(window.location.href);
                      url.searchParams.set("filter", id);
                      window.history.replaceState(null, "", url.toString());
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      filter === id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {filterLabels[id]}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Session ID</TableHead>
                    <TableHead className="text-muted-foreground">Duration</TableHead>
                    <TableHead className="text-muted-foreground">Events</TableHead>
                    <TableHead className="text-muted-foreground">Device</TableHead>
                    <TableHead className="text-muted-foreground">Browser / OS</TableHead>
                    <TableHead className="text-muted-foreground">Scroll</TableHead>
                    <TableHead className="text-muted-foreground">Time</TableHead>
                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((session) => {
                    const DeviceIcon = deviceIcons[session.deviceType as keyof typeof deviceIcons] || Monitor;
                    const scrollData = session.scrollDepth.map((value, i) => ({ i, value }));
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
                              <span className="truncate max-w-[120px]" title={session.id}>{session.id}</span>
                            </div>
                            <div className="flex gap-1 flex-wrap">
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
                          <Badge variant="secondary">{session.pages} events</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DeviceIcon className="h-4 w-4" />
                            {session.deviceType}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {session.browser} / {session.os}
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
                        <TableCell className="text-muted-foreground text-xs">{session.timestamp}</TableCell>
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
                  {!loading && paginated.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        No sessions found for the selected filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border px-6 py-3">
                <p className="text-sm text-muted-foreground">
                  Showing {pageStart.toLocaleString("en-US")}–{pageEnd.toLocaleString("en-US")} of{" "}
                  {totalFiltered.toLocaleString("en-US")} sessions
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline" size="sm" className="gap-1 border-border"
                    disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">{page} / {totalPages}</span>
                  <Button
                    variant="outline" size="sm" className="gap-1 border-border"
                    disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
                  <p className="font-mono text-sm break-all">{selectedSession.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Visitor ID</p>
                  <p className="font-mono text-xs break-all text-muted-foreground">{selectedSession.visitorId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Duration</p>
                  <p className={cn("font-semibold", durationColor(selectedSession.durationSecs))}>{selectedSession.duration}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Device &amp; Browser</p>
                  <p className="text-sm">{selectedSession.deviceType} · {selectedSession.browser} / {selectedSession.os}</p>
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

export default function SessionsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <SessionsList />
    </Suspense>
  );
}
