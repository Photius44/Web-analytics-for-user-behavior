"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Flame, Mouse, ArrowDown, ZoomIn, ZoomOut, RotateCcw, ChevronDown, BarChart2 } from "lucide-react";

const pages = ["/home", "/pricing", "/products"] as const;
type PagePath = (typeof pages)[number];

const avgScrollDepths: Record<PagePath, number> = {
  "/home": 64,
  "/pricing": 71,
  "/products": 58,
};

export default function HeatmapPage() {
  const [heatmapType, setHeatmapType] = useState<"click" | "scroll">("click");
  const [selectedPage, setSelectedPage] = useState<PagePath>("/home");

  const avgScroll = avgScrollDepths[selectedPage];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20">
              <Flame className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Heatmap</h1>
              <p className="text-muted-foreground">
                Visualize user interactions on your website.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Page Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-border bg-secondary font-mono text-sm">
                  {selectedPage}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {pages.map((p) => (
                  <DropdownMenuItem key={p} onClick={() => setSelectedPage(p)} className="font-mono text-sm">
                    {p}
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

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Heatmap Preview */}
          <div className="lg:col-span-3">
            <Card className="bg-card border-border overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-semibold">Website Preview</CardTitle>
                  <Badge variant="outline" className="font-mono text-xs">{selectedPage}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><ZoomOut className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><ZoomIn className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><RotateCcw className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative bg-background/50 h-[600px] flex">
                  {/* Mock Website */}
                  <div className="flex-1 bg-card mx-4 my-4 overflow-hidden border border-border rounded-lg relative">
                    {/* Realistic Navbar */}
                    <div className="flex items-center justify-between border-b border-border px-6 py-3 bg-secondary/40">
                      <div className="flex items-center gap-6">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                            <div className="h-3.5 w-3.5 rounded-sm bg-primary-foreground/80" />
                          </div>
                          <div className="h-4 w-16 rounded bg-foreground/20" />
                        </div>
                        {/* Nav links */}
                        <div className="hidden sm:flex items-center gap-5">
                          {["Product", "Pricing", "Blog", "Docs"].map((label) => (
                            <div key={label} className="h-3 rounded bg-muted/60" style={{ width: `${label.length * 7}px` }} />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-16 rounded border border-border bg-transparent" />
                        <div className="h-7 w-20 rounded bg-primary" />
                      </div>
                    </div>

                    {/* Hero */}
                    <div className="px-10 py-12 text-center bg-gradient-to-b from-secondary/40 to-transparent">
                      <div className="mx-auto h-2 w-20 rounded-full bg-primary/40 mb-4" />
                      <div className="mx-auto h-9 w-3/4 rounded-lg bg-foreground/15 mb-3" />
                      <div className="mx-auto h-6 w-1/2 rounded bg-foreground/10 mb-2" />
                      <div className="mx-auto h-4 w-2/5 rounded bg-muted/60 mb-8" />
                      <div className="flex justify-center gap-3">
                        <div className="h-9 w-28 rounded-md bg-primary" />
                        <div className="h-9 w-28 rounded-md border border-border bg-transparent" />
                      </div>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-3 gap-4 px-6 pb-8">
                      {[
                        { w: "60%", lines: ["80%", "70%", "55%"] },
                        { w: "65%", lines: ["75%", "85%", "60%"] },
                        { w: "55%", lines: ["90%", "65%", "70%"] },
                      ].map((card, i) => (
                        <div key={i} className="rounded-lg border border-border bg-secondary/30 p-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/25 mb-3" />
                          <div className="h-3.5 rounded bg-foreground/15 mb-2" style={{ width: card.w }} />
                          {card.lines.map((w, j) => (
                            <div key={j} className="h-2.5 rounded bg-muted/50 mb-1.5" style={{ width: w }} />
                          ))}
                          <div className="mt-3 h-7 w-20 rounded bg-primary/20" />
                        </div>
                      ))}
                    </div>

                    {/* Heatmap Overlay */}
                    <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
                      {heatmapType === "click" ? (
                        <>
                          <div className="absolute rounded-full" style={{ top: "13%", left: "70%", width: 110, height: 110, background: "radial-gradient(circle, rgba(239,68,68,0.85) 0%, rgba(239,68,68,0.3) 50%, transparent 70%)" }} />
                          <div className="absolute flex items-center justify-center" style={{ top: "13%", left: "70%", width: 110, height: 110 }}>
                            <span className="bg-destructive/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Rage Clicks</span>
                          </div>
                          <div className="absolute rounded-full" style={{ top: "35%", left: "25%", width: 90, height: 90, background: "radial-gradient(circle, rgba(249,115,22,0.65) 0%, rgba(234,179,8,0.3) 50%, transparent 70%)" }} />
                          <div className="absolute rounded-full" style={{ top: "35%", left: "50%", width: 80, height: 80, background: "radial-gradient(circle, rgba(249,115,22,0.5) 0%, rgba(234,179,8,0.2) 50%, transparent 70%)" }} />
                          <div className="absolute rounded-full" style={{ top: "60%", left: "20%", width: 70, height: 70, background: "radial-gradient(circle, rgba(249,115,22,0.45) 0%, rgba(234,179,8,0.15) 50%, transparent 70%)" }} />
                          <div className="absolute rounded-full" style={{ top: "60%", left: "50%", width: 65, height: 65, background: "radial-gradient(circle, rgba(234,179,8,0.4) 0%, transparent 65%)" }} />
                          <div className="absolute rounded-full" style={{ top: "62%", right: "15%", width: 60, height: 60, background: "radial-gradient(circle, rgba(34,197,94,0.35) 0%, transparent 65%)" }} />
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-x-0 top-0 h-1/4" style={{ background: "linear-gradient(to bottom, rgba(239,68,68,0.3), rgba(249,115,22,0.2))" }} />
                          <div className="absolute inset-x-0 top-1/4 h-1/4" style={{ background: "linear-gradient(to bottom, rgba(249,115,22,0.2), rgba(234,179,8,0.15))" }} />
                          <div className="absolute inset-x-0 top-1/2 h-1/4" style={{ background: "linear-gradient(to bottom, rgba(234,179,8,0.15), rgba(34,197,94,0.1))" }} />
                          <div className="absolute inset-x-0 top-3/4 h-1/4" style={{ background: "linear-gradient(to bottom, rgba(34,197,94,0.1), transparent)" }} />
                          {/* Average fold dashed line */}
                          <div
                            className="absolute inset-x-0 border-t-2 border-dashed border-primary/60 flex items-center"
                            style={{ top: `${avgScroll}%` }}
                          >
                            <span className="ml-2 rounded bg-primary/80 px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">Avg fold</span>
                          </div>
                        </>
                      )}
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
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {heatmapType === "click" ? "Total Clicks" : "Total Sessions"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {heatmapType === "click" ? "12,847" : "8,234"}
                </p>
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
                {[
                  { color: "bg-destructive", label: "CTA Button", count: "2,341" },
                  { color: "bg-orange-500", label: "Sign Up", count: "1,892" },
                  { color: "bg-yellow-500", label: "Navigation", count: "1,456" },
                  { color: "bg-success", label: "Features", count: "892" },
                ].map((zone) => (
                  <div key={zone.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${zone.color}`} />
                      <span className="text-sm">{zone.label}</span>
                    </div>
                    <span className="text-sm font-medium">{zone.count}</span>
                  </div>
                ))}
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
      </div>
    </DashboardLayout>
  );
}
