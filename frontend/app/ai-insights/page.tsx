"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { aiInsights, uxSuggestions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  AlertTriangle,
  AlertCircle,
  Info,
  Lightbulb,
  Download,
  RefreshCw,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";

const severityConfig = {
  high: {
    color: "bg-destructive/20 text-destructive border-destructive/30",
    icon: AlertTriangle,
    leftBorder: "border-l-destructive",
  },
  medium: {
    color: "bg-warning/20 text-warning border-warning/30",
    icon: AlertCircle,
    leftBorder: "border-l-warning",
  },
  low: {
    color: "bg-primary/20 text-primary border-primary/30",
    icon: Info,
    leftBorder: "border-l-primary",
  },
};

const impactConfig = {
  high: "bg-destructive/20 text-destructive",
  medium: "bg-warning/20 text-warning",
  low: "bg-muted text-muted-foreground",
};

const BASE_SCORE = 72;
const POINTS_PER_SUGGESTION = 3;

export default function AIInsightsPage() {
  const [suggestions, setSuggestions] = useState(uxSuggestions);
  const [displayedScore, setDisplayedScore] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const completedCount = suggestions.filter((s) => s.completed).length;
  const extraPoints = completedCount * POINTS_PER_SUGGESTION;
  const uxScore = Math.min(100, BASE_SCORE + extraPoints);

  // Animate score from 0 → target on mount and whenever uxScore changes
  useEffect(() => {
    let frame: number;
    let current = displayedScore;
    const target = uxScore;
    const duration = 1500; // ms
    const steps = 60;
    const increment = (target - current) / steps;

    const tick = () => {
      current += increment;
      if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
        setDisplayedScore(target);
        return;
      }
      setDisplayedScore(current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uxScore]);

  const toggleSuggestion = (id: number) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const viewEvidence = (sessionIds: string[]) => {
    if (sessionIds && sessionIds.length > 0) {
      router.push(`/sessions?ids=${sessionIds.join(",")}`);
    }
  };

  const circumference = 2 * Math.PI * 42; // r=42

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Insights</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-muted-foreground">Last analyzed: 2 hours ago</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-primary hover:text-primary gap-1"
                  onClick={handleRefresh}
                >
                  <RefreshCw className={cn("h-3 w-3", refreshing && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Critical Discoveries */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Critical Discoveries</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {aiInsights.slice(0, 2).map((insight) => {
              const { color, icon: Icon } = severityConfig[insight.severity];
              const isHigh = insight.severity === "high";
              return (
                <Card
                  key={insight.id}
                  className={cn(
                    "border-2 relative overflow-hidden",
                    isHigh
                      ? "bg-destructive/10 border-destructive/30"
                      : "bg-warning/10 border-warning/30"
                  )}
                >
                  {/* Subtle glow */}
                  <div
                    className="pointer-events-none absolute -inset-px rounded-xl opacity-30"
                    style={{
                      boxShadow: isHigh
                        ? "inset 0 0 40px rgba(239,68,68,0.3)"
                        : "inset 0 0 40px rgba(234,179,8,0.25)",
                    }}
                  />
                  <CardContent className="p-5 relative">
                    <div className="flex items-start gap-4">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", color.split(" ")[0])}>
                        <Icon className={cn("h-5 w-5", color.split(" ")[1])} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-base">{insight.title}</h3>
                          <Badge variant="outline" className={cn("capitalize shrink-0", color)}>
                            {insight.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.explanation}</p>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-sm font-medium text-primary">{insight.recommendation}</span>
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs font-semibold text-primary hover:text-primary/80 gap-1.5"
                            onClick={() => viewEvidence((insight as any).correlatedSessionIds)}
                          >
                            Analyze Evidence
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* All Insights */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">All Insights</h2>
            {aiInsights.map((insight) => {
              const { color, icon: Icon, leftBorder } = severityConfig[insight.severity];
              return (
                <Card
                  key={insight.id}
                  className={cn(
                    "bg-card border-border border-l-[3px] hover:border-primary/50 transition-all duration-300",
                    leftBorder
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", color.split(" ")[0])}>
                        <Icon className={cn("h-5 w-5", color.split(" ")[1])} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold">{insight.title}</h3>
                          <Badge variant="outline" className={cn("capitalize shrink-0", color)}>
                            {insight.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.explanation}</p>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-sm font-medium text-primary">{insight.recommendation}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs font-semibold text-primary hover:text-primary/10 gap-1.5"
                            onClick={() => viewEvidence((insight as any).correlatedSessionIds)}
                          >
                            View Evidence
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* UX Score */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">UX Score</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative flex h-40 w-40 items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle className="stroke-secondary" strokeWidth="8" fill="none" r="42" cx="50" cy="50" />
                    <circle
                      className="stroke-primary"
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="none"
                      r="42"
                      cx="50"
                      cy="50"
                      strokeDasharray={`${(displayedScore / 100) * circumference} ${circumference}`}
                      style={{ transition: "stroke-dasharray 80ms linear" }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-bold">{Math.round(displayedScore)}</span>
                    <span className="text-sm text-muted-foreground">out of 100</span>
                  </div>
                </div>
                {/* +4 pts indicator */}
                <div className="mt-3 flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1">
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                  <span className="text-xs font-semibold text-success">+4 points this week</span>
                </div>
                <p className="mt-3 text-center text-sm text-muted-foreground">
                  Your UX score is <span className="font-medium text-foreground">good</span>. Complete more suggestions to improve it.
                </p>
              </CardContent>
            </Card>

            {/* UX Suggestions */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">UX Suggestions</CardTitle>
                <span className="text-sm text-muted-foreground">{completedCount}/{suggestions.length}</span>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={(completedCount / suggestions.length) * 100} className="h-2" />
                <div className="space-y-2 pt-2">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg p-2 transition-all",
                        suggestion.completed ? "bg-success/10" : "hover:bg-secondary"
                      )}
                    >
                      <Checkbox
                        checked={suggestion.completed}
                        onCheckedChange={() => toggleSuggestion(suggestion.id)}
                        className="border-muted-foreground"
                      />
                      <span className={cn("flex-1 text-sm", suggestion.completed && "line-through text-muted-foreground")}>
                        {suggestion.suggestion}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn("text-xs shrink-0", impactConfig[suggestion.impact as keyof typeof impactConfig])}
                      >
                        {suggestion.impact}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
