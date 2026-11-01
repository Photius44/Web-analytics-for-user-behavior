"use client";

import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useProject } from "@/context/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Flame,
  Mouse,
  ArrowDown,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronDown,
  BarChart2,
  Globe,
  Search,
  AlertTriangle,
} from "lucide-react";

const avgScrollDepths: Record<string, number> = {
  "/home": 64,
  "/pricing": 71,
  "/products": 58,
};

// Fallback mock click points shown only when backend is offline
const mockClickPoints = [
  { x: 780, y: 30, value: 1 },
  { x: 380, y: 280, value: 5 },
  { x: 490, y: 280, value: 3 },
  { x: 220, y: 30, value: 2 },
  { x: 180, y: 150, value: 4 },
];

export default function HeatmapPage() {
  const [heatmapType, setHeatmapType] = useState<"click" | "scroll">("click");
  const [pages, setPages] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [points, setPoints] = useState<{ x: number; y: number; value: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [iframeScrollY, setIframeScrollY] = useState(0);
  const [iframeHeight, setIframeHeight] = useState(2000);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (iframe?.contentWindow && iframe?.contentDocument) {
      try {
        // Intercept route navigation inside the iframe
        let currentPath = iframe.contentWindow.location.pathname;
        if (currentPath === '/') {
          currentPath = '/index.html';
        }
        setSelectedPage(currentPath);

        // Set initial scroll & height
        setIframeScrollY(iframe.contentWindow.scrollY || 0);
        const docHeight = iframe.contentDocument.documentElement.scrollHeight || 2000;
        setIframeHeight(docHeight);

        // Clean up previous scroll listener if any, then attach a fresh one
        const iframeEl = iframe as HTMLIFrameElement & { _scrollHandler?: () => void };
        if (iframeEl._scrollHandler) {
          iframe.contentWindow.removeEventListener('scroll', iframeEl._scrollHandler);
        }
        const handleScroll = () => {
          if (iframe.contentWindow) {
            setIframeScrollY(iframe.contentWindow.scrollY);
          }
        };
        iframeEl._scrollHandler = handleScroll;
        iframe.contentWindow.addEventListener('scroll', handleScroll);
      } catch (err) {
        console.error("Failed to sync iframe scroll or navigation:", err);
      }
    }
  };

  const { selectedProject } = useProject();
  const projectId = selectedProject?.id ?? "";
  const domain = selectedProject?.domain ?? "your-domain.com";
  const avgScroll = avgScrollDepths[selectedPage] || 50;

  // Load page paths dynamically
  useEffect(() => {
    if (!projectId) {
      setPages([]);
      setSelectedPage("");
      return;
    }

    fetch(`http://localhost:5000/api/analytics/tracked-pages?projectId=${projectId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load page paths");
        return res.json();
      })
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setPages(json.data);
          if (json.data.length > 0) {
            // Find default home path or take first path
            const initial = json.data.find((p: string) => p === '/' || p === '/index.html' || p === '/index') || json.data[0];
            setSelectedPage(initial);
          } else {
            setSelectedPage("");
          }
        }
      })
      .catch((err) => {
        console.error("[Heatmap page load error]:", err);
      });
  }, [projectId]);

  // Fetch heatmap data reactively when page or project changes
  useEffect(() => {
    if (!projectId || !selectedPage) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const encodedUrl = encodeURIComponent(selectedPage);
    const fetchUrl = `http://localhost:5000/api/analytics/heatmap?projectId=${projectId}&pageUrl=${encodedUrl}`;

    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load heatmap data (HTTP ${res.status})`);
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          if (json.success) {
            setPoints(json.data);
          } else {
            throw new Error(json.error || "Failed to retrieve coordinates");
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("[Heatmap fetch error]:", err);
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [selectedPage, projectId]);

  // Use real DB points or fallback mock points
  const isFallback = !!error || points.length === 0;
  const displayPoints = isFallback ? mockClickPoints : points;
  const totalClicksCount = isFallback
    ? mockClickPoints.reduce((acc, p) => acc + p.value, 0)
    : points.reduce((acc, p) => acc + p.value, 0);

  const hasNoData = !loading && !error && pages.length === 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20">
              <Flame className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Heatmap</h1>
              <p className="text-muted-foreground text-sm">
                Visualize user interactions on{" "}
                <span className="font-mono text-xs text-primary">{domain}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
            {/* Page Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-border bg-secondary font-mono text-sm">
                  {selectedPage === '/' ? '/index.html (Home Page)' : (selectedPage || "No pages tracked")}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {pages.map((p) => (
                  <DropdownMenuItem key={p} onClick={() => setSelectedPage(p)} className="font-mono text-sm">
                    {p === '/' ? '/index.html (Home Page)' : p}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Tabs
              value={heatmapType}
              onValueChange={(v) => setHeatmapType(v as "click" | "scroll")}
            >
              <TabsList className="bg-secondary">
                <TabsTrigger value="click" className="gap-2">
                  <Mouse className="h-4 w-4" />
                  Click
                </TabsTrigger>
                <TabsTrigger value="scroll" className="gap-2">
                  <ArrowDown className="h-4 w-4" />
                  Scroll
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Offline Error Banner */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <span className="font-semibold">Backend Server Offline:</span>{" "}
              Failed to fetch live heatmap coordinates. Displaying simulation data.
            </div>
          </div>
        )}

        {hasNoData ? (
          <EmptyState projectId={projectId} domain={domain} />
        ) : (
          <>
            {/* Empty state when backend is online but no data */}
            {!error && !loading && points.length === 0 && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  No click events recorded for <span className="font-mono font-semibold text-foreground">{selectedPage}</span> yet.
                  Make sure tracker.js is installed on{" "}
                  <span className="font-mono font-semibold text-foreground">{domain}</span> and users are visiting the page.
                </span>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-4">
              {/* Heatmap Preview */}
              <div className="lg:col-span-3">
                <Card className="bg-card border-border overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-semibold">Website Preview</CardTitle>
                      <Badge variant="outline" className="font-mono text-xs">{selectedPage}</Badge>
                      {isFallback && (
                        <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30 bg-amber-500/10">
                          Simulation
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><ZoomOut className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><ZoomIn className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><RotateCcw className="h-4 w-4" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative bg-background/50 h-[700px] flex flex-col p-4">
                      {/* Browser URL Bar — shows actual domain */}
                      <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-secondary/80 p-2 shadow-sm">
                        <div className="flex gap-1.5 px-2">
                          <div className="h-3 w-3 rounded-full bg-destructive/50" />
                          <div className="h-3 w-3 rounded-full bg-warning/50" />
                          <div className="h-3 w-3 rounded-full bg-success/50" />
                        </div>
                        <div className="flex flex-1 items-center gap-2 rounded bg-background px-3 py-1 text-xs text-muted-foreground border border-border/50">
                          <Globe className="h-3.5 w-3.5" />
                          <span className="flex-1">{domain}{selectedPage === '/' ? '/index.html' : selectedPage}</span>
                          <Search className="h-3 w-3" />
                        </div>
                      </div>

                      {/* Website Preview Canvas */}
                      <div className="flex-1 bg-card border border-border rounded-lg relative shadow-2xl flex flex-col overflow-hidden">

                        {/* Loading Overlay */}
                        {loading && (
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-50">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            <span className="text-xs text-muted-foreground mt-2 font-semibold">Loading heatmap coordinates...</span>
                          </div>
                        )}

                        {/* Preview viewport wrapper - fills the canvas container */}
                        <div className="relative w-full h-full flex-1 overflow-hidden">
                          
                          {/* Live website iframe — loads the actual client site and scrolls internally */}
                          <iframe
                            ref={iframeRef}
                            src={`http://localhost:5173${selectedPage}`}
                            title={`Preview: ${selectedPage}`}
                            className="absolute inset-0 w-full h-full border-0"
                            sandbox="allow-scripts allow-same-origin"
                            onLoad={handleIframeLoad}
                          />

                          {/* Heatmap Overlay — click dots or scroll gradient translated dynamically */}
                          <div 
                            className="absolute inset-x-0 top-0 pointer-events-none z-10 w-full overflow-hidden"
                            style={{ height: `${iframeHeight}px`, transform: `translateY(${-iframeScrollY}px)` }}
                          >
                              {heatmapType === "click" ? (
                                <>
                                  {displayPoints.map((pt, idx) => (
                                    <div
                                      key={idx}
                                      className="absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse"
                                      style={{
                                        left: `${pt.x}px`,
                                        top: `${pt.y}px`,
                                        width: `${Math.min(30 + pt.value * 15, 120)}px`,
                                        height: `${Math.min(30 + pt.value * 15, 120)}px`,
                                        background: pt.value > 3
                                          ? "radial-gradient(circle, rgba(239,68,68,0.85) 0%, rgba(249,115,22,0.45) 45%, transparent 70%)"
                                          : "radial-gradient(circle, rgba(249,115,22,0.7) 0%, rgba(234,179,8,0.3) 45%, transparent 70%)",
                                      }}
                                    />
                                  ))}
                                </>
                              ) : (
                                <>
                                  <div className="absolute inset-x-0 top-0 h-1/4" style={{ background: "linear-gradient(to bottom, rgba(239,68,68,0.4), rgba(249,115,22,0.25))" }} />
                                  <div className="absolute inset-x-0 top-1/4 h-1/4" style={{ background: "linear-gradient(to bottom, rgba(249,115,22,0.25), rgba(234,179,8,0.2))" }} />
                                  <div className="absolute inset-x-0 top-1/2 h-1/4" style={{ background: "linear-gradient(to bottom, rgba(234,179,8,0.2), rgba(34,197,94,0.15))" }} />
                                  <div className="absolute inset-x-0 top-3/4 h-1/4" style={{ background: "linear-gradient(to bottom, rgba(34,197,94,0.15), transparent)" }} />
                                  <div
                                    className="absolute inset-x-0 border-t-2 border-dashed border-primary/60 flex items-center"
                                    style={{ top: `${avgScroll}%` }}
                                  >
                                    <span className="ml-2 rounded bg-primary/90 px-2 py-0.5 text-[10px] font-black text-primary-foreground uppercase tracking-widest shadow-lg">Current Fold</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                      {/* Scroll Depth Ruler */}
                      {heatmapType === "scroll" && (
                        <div className="flex flex-col justify-between py-4 pr-2 w-10 text-[10px] text-muted-foreground font-medium">
                          {["100%", "75%", "50%", "25%", "0%"].map((label) => (
                            <div key={label} className="flex items-center gap-1">
                              <div className="h-px w-2 bg-border" />
                              <span>{label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {heatmapType === "click" ? "Total Clicks" : "Total Sessions"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {heatmapType === "click"
                        ? totalClicksCount.toLocaleString()
                        : "—"}
                    </p>
                    {isFallback && heatmapType === "click" && (
                      <p className="text-[10px] text-muted-foreground mt-1">* Simulation data</p>
                    )}
                  </CardContent>
                </Card>

                {/* Avg. Scroll Depth — shown in scroll mode */}
                {heatmapType === "scroll" && (
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <BarChart2 className="h-4 w-4" />
                        Avg. Scroll Depth
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className="relative h-32 w-5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="absolute bottom-0 left-0 right-0 rounded-full bg-primary transition-all duration-700"
                            style={{ height: `${avgScroll}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{avgScroll}%</p>
                        <p className="text-xs text-muted-foreground mt-1">of page seen</p>
                        <p className="text-xs text-muted-foreground">on {selectedPage}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Hot Zones
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {displayPoints
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 4)
                      .map((pt, i) => {
                        const labels = ["CTA Button", "Sign Up", "Navigation", "Features"];
                        const colors = ["bg-destructive", "bg-orange-500", "bg-yellow-500", "bg-success"];
                        return (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`h-3 w-3 rounded-full ${colors[i % colors.length]}`} />
                              <span className="text-sm">{labels[i % labels.length]}</span>
                            </div>
                            <span className="text-sm font-medium">{pt.value.toLocaleString()}</span>
                          </div>
                        );
                      })}
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Legend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 flex-1 rounded-full bg-gradient-to-r from-success via-yellow-500 via-orange-500 to-destructive" />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">Low</span>
                      <span className="text-xs text-muted-foreground">High</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
