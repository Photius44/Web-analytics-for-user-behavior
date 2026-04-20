"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Flame, Mouse, ArrowDown, ZoomIn, ZoomOut, RotateCcw, ChevronDown, BarChart2, Globe, Search, Sparkles } from "lucide-react";

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
                <div className="relative bg-background/50 h-[700px] flex flex-col p-4">
                  {/* Browser-style URL Bar */}
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-secondary/80 p-2 shadow-sm">
                    <div className="flex gap-1.5 px-2">
                      <div className="h-3 w-3 rounded-full bg-destructive/50" />
                      <div className="h-3 w-3 rounded-full bg-warning/50" />
                      <div className="h-3 w-3 rounded-full bg-success/50" />
                    </div>
                    <div className="flex flex-1 items-center gap-2 rounded bg-background px-3 py-1 text-xs text-muted-foreground border border-border/50">
                      <Globe className="h-3.5 w-3.5" />
                      <span className="flex-1">https://analytics.io{selectedPage}</span>
                      <Search className="h-3 w-3" />
                    </div>
                  </div>

                  {/* Mock Website - Detailed Simulation */}
                  <div className="flex-1 bg-card overflow-hidden border border-border rounded-lg relative shadow-2xl">
                    {/* Realistic Navbar */}
                    <div className="flex items-center justify-between border-b border-border px-8 py-4 bg-background">
                      <div className="flex items-center gap-10">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <span className="font-bold text-sm tracking-tight">ANALYTICS.IO</span>
                        </div>
                        {/* Nav links */}
                        <div className="hidden md:flex items-center gap-6">
                           {["Product", "Features", "Pricing", "Enterprise"].map((label) => (
                             <span key={label} className={cn(
                               "text-xs font-semibold hover:text-primary cursor-pointer transition-colors",
                               label === "Product" ? "text-primary" : "text-muted-foreground"
                             )}>
                               {label}
                             </span>
                           ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="text-xs font-bold">Sign In</Button>
                        <Button size="sm" className="text-xs font-bold bg-primary text-primary-foreground px-5" id="cta-header">Get Started</Button>
                      </div>
                    </div>

                    {/* Hero Section */}
                    <div className="px-12 py-20 text-center relative overflow-hidden">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
                      <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">NEW: AI INSIGHTS 2.0</Badge>
                      <h2 className="mx-auto text-4xl font-black max-w-2xl leading-tight mb-4 tracking-tight">
                        Understand Every <span className="text-primary italic">User Action</span> with AI
                      </h2>
                      <p className="mx-auto text-muted-foreground max-w-lg mb-8 text-sm leading-relaxed">
                        The only analytics platform that doesn&apos;t just show you data, but tells you what to do with it. Optimize your UX in minutes.
                      </p>
                      <div className="flex justify-center gap-4">
                        <Button size="lg" className="h-12 px-8 font-bold text-sm shadow-xl shadow-primary/20" id="cta-hero-main">
                           Start Building for Free
                        </Button>
                        <Button variant="outline" size="lg" className="h-12 px-8 border-border bg-card hover:bg-secondary font-bold text-sm" id="cta-hero-demo">
                          Watch Live Demo
                        </Button>
                      </div>
                    </div>

                    {/* Dashboard Preview Simulation */}
                    <div className="mx-auto max-w-4xl px-8">
                       <div className="rounded-t-xl border-x border-t border-border bg-secondary/30 h-40 p-4">
                          <div className="grid grid-cols-4 gap-4 h-full">
                             {[1,2,3,4].map(i => (
                               <div key={i} className="rounded-lg bg-card/80 border border-border/50 p-3 flex flex-col justify-center">
                                  <div className="h-2 w-12 rounded bg-muted/40 mb-2" />
                                  <div className="h-4 w-20 rounded bg-foreground/10" />
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Heatmap Overlay with Precise Placement */}
                    <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
                      {heatmapType === "click" ? (
                        <>
                          {/* CTA Header Click */}
                          <div className="absolute rounded-full" style={{ top: "12%", right: "8%", width: 80, height: 80, background: "radial-gradient(circle, rgba(239,68,68,0.7) 0%, transparent 70%)" }} />
                          
                          {/* Main Hero CTA - Hot Zone */}
                          <div className="absolute rounded-full" style={{ top: "45%", left: "42%", width: 150, height: 150, background: "radial-gradient(circle, rgba(239,68,68,0.9) 0%, rgba(249,115,22,0.4) 40%, transparent 75%)" }} />
                          <div className="absolute flex flex-col items-center justify-center text-center" style={{ top: "45%", left: "42%", width: 150, height: 150 }}>
                            <span className="bg-destructive/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Hot Zone</span>
                            <span className="text-[10px] font-bold text-white mt-1">45% clicks</span>
                          </div>

                          {/* Secondary Hero CTA */}
                          <div className="absolute rounded-full" style={{ top: "45%", left: "55%", width: 120, height: 120, background: "radial-gradient(circle, rgba(234,179,8,0.6) 0%, transparent 70%)" }} />
                          
                          {/* Navigation Click */}
                          <div className="absolute rounded-full" style={{ top: "12%", left: "22%", width: 60, height: 60, background: "radial-gradient(circle, rgba(34,197,94,0.5) 0%, transparent 70%)" }} />

                          {/* Rage Click indicator on specific element */}
                          <div className="absolute rounded-full" style={{ top: "25%", left: "15%", width: 70, height: 70, background: "radial-gradient(circle, rgba(239,68,68,0.8) 0%, transparent 70%)" }} />
                          <div className="absolute flex items-center justify-center" style={{ top: "25%", left: "15%", width: 70, height: 70 }}>
                            <Badge className="bg-destructive text-white border-none text-[8px] animate-bounce">Rage Click</Badge>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-x-0 top-0 h-1/4" style={{ background: "linear-gradient(to bottom, rgba(239,68,68,0.4), rgba(249,115,22,0.25))" }} />
                          <div className="absolute inset-x-0 top-1/4 h-1/4" style={{ background: "linear-gradient(to bottom, rgba(249,115,22,0.25), rgba(234,179,8,0.2))" }} />
                          <div className="absolute inset-x-0 top-1/2 h-1/4" style={{ background: "linear-gradient(to bottom, rgba(234,179,8,0.2), rgba(34,197,94,0.15))" }} />
                          <div className="absolute inset-x-0 top-3/4 h-1/4" style={{ background: "linear-gradient(to bottom, rgba(34,197,94,0.15), transparent)" }} />
                          {/* Average fold dashed line */}
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
