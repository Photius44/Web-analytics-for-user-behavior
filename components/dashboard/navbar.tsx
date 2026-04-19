"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, ChevronDown, Calendar, TrendingUp, Zap, Sparkles, LayoutDashboard, BarChart3, Flame, Play, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const notifications = [
  {
    id: 1,
    icon: TrendingUp,
    color: "text-destructive",
    bg: "bg-destructive/10",
    title: "Bounce rate spike detected",
    desc: "Landing page bounce rate jumped to 72%",
    time: "5m ago",
    unread: true,
  },
  {
    id: 2,
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    title: "Session milestone: 25K reached",
    desc: "You've hit 25,000 total sessions this month",
    time: "1h ago",
    unread: true,
  },
  {
    id: 3,
    icon: Sparkles,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "New AI insight available",
    desc: "3 new recommendations ready to review",
    time: "3h ago",
    unread: false,
  },
];

const commandItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Heatmap", href: "/heatmap", icon: Flame },
  { label: "Sessions", href: "/sessions", icon: Play },
  { label: "AI Insights", href: "/ai-insights", icon: Sparkles },
  { label: "Settings", href: "/settings", icon: Settings },
];

const dateRanges = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "This year", value: "1y" },
];

export function Navbar() {
  const [selectedRange, setSelectedRange] = useState(dateRanges[0]);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const router = useRouter();

  const openCmd = useCallback(() => { setCmdOpen(true); setCmdQuery(""); }, []);
  const closeCmd = useCallback(() => setCmdOpen(false), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
        setCmdQuery("");
      }
      if (e.key === "Escape") closeCmd();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeCmd]);

  const filteredCmd = commandItems.filter((item) =>
    item.label.toLowerCase().includes(cmdQuery.toLowerCase())
  );

  return (
    <>
      {/* Command Palette Overlay */}
      {cmdOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm"
          onClick={closeCmd}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-border bg-popover shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder="Search pages..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
                ESC
              </kbd>
            </div>
            <div className="py-2">
              {filteredCmd.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">No results found.</p>
              ) : (
                filteredCmd.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => { router.push(item.href); closeCmd(); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary transition-colors text-left"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-full items-center justify-between px-6">
          {/* Search / ⌘K trigger */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <button
              onClick={openCmd}
              className="flex w-full items-center gap-2 rounded-md border border-border bg-secondary px-10 py-2 text-sm text-muted-foreground hover:border-primary/50 transition-colors text-left"
            >
              Search analytics...
              <kbd className="ml-auto hidden sm:inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Date Range Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 border-border bg-secondary hover:bg-secondary/80"
                >
                  <Calendar className="h-4 w-4" />
                  {selectedRange.label}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {dateRanges.map((range) => (
                  <DropdownMenuItem
                    key={range.value}
                    onClick={() => setSelectedRange(range)}
                    className={
                      selectedRange.value === range.value
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }
                  >
                    {range.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-muted-foreground hover:text-foreground"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground animate-pulse">
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-sm font-semibold">Notifications</span>
                  <Badge variant="secondary" className="text-xs">3 new</Badge>
                </div>
                <div className="divide-y divide-border">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div key={n.id} className={cn("flex items-start gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors cursor-default", n.unread && "bg-primary/5")}>
                        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-0.5", n.bg)}>
                          <Icon className={cn("h-4 w-4", n.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.desc}</p>
                          <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                        </div>
                        {n.unread && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 py-2 border-t border-border">
                  <button className="text-xs text-primary hover:underline">Mark all as read</button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 hover:bg-secondary"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium">
                    John Doe
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}
