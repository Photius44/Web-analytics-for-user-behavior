"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3,
  Flame,
  Play,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/heatmap", label: "Heatmap", icon: Flame },
  { href: "/sessions", label: "Sessions", icon: Play },
  { href: "/ai-insights", label: "AI Insights", icon: Sparkles, highlight: true },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-sidebar-foreground">
                Analytics
              </span>
            </Link>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary mx-auto">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <TooltipProvider delayDuration={0}>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              const linkEl = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    item.highlight && !isActive && "text-primary",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      item.highlight && !isActive && "text-primary"
                    )}
                  />
                  {!collapsed && (
                    <span className="flex items-center gap-2">
                      {item.label}
                      {item.highlight && (
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </span>
                  )}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return linkEl;
            })}
          </nav>
        </TooltipProvider>

        {/* Collapse Button */}
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full justify-center text-muted-foreground hover:text-sidebar-foreground",
              !collapsed && "justify-start px-3"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
