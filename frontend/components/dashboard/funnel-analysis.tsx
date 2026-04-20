"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { funnelData } from "@/lib/mock-data";
import { Users, ArrowDownRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function FunnelAnalysis() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Conversion Funnel</CardTitle>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-wider">
          <Sparkles className="h-3 w-3" />
          AI Insight Active
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative space-y-4">
          {funnelData.map((step, i) => {
            const nextStep = funnelData[i + 1];
            return (
              <div key={step.step} className="relative">
                <div className="flex items-center gap-4">
                  {/* Funnel Shape Segment */}
                  <div 
                    className={cn(
                      "relative h-16 flex flex-col justify-center px-6 rounded-r-xl border-l-4 border-primary transition-all duration-500 hover:bg-primary/5",
                      i === 0 ? "bg-primary/20 w-full" : 
                      i === 1 ? "bg-primary/15 w-[85%]" :
                      i === 2 ? "bg-primary/10 w-[70%]" :
                      "bg-primary/5 w-[55%]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{step.step}</p>
                        <p className="text-xl font-bold">{step.visitors.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary/40">{step.percentage}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Drop-off Info */}
                  {step.dropoff > 0 && (
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-1.5 text-destructive font-bold text-sm">
                        <ArrowDownRight className="h-4 w-4" />
                        {step.dropoff}% drop-off
                      </div>
                      {step.step === "Viewed Pricing" && (
                        <div className="max-w-[180px] rounded-lg bg-secondary/50 p-2 border border-border">
                           <p className="text-[10px] leading-relaxed text-muted-foreground">
                            <span className="font-bold text-primary">AI Insight:</span> Funnel drop-off high on Pricing page. Gợi ý: Simplify mobile grid layout.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Visual Connector */}
                {nextStep && (
                  <div className="absolute left-[10%] -bottom-4 h-4 w-px bg-gradient-to-b from-primary/30 to-transparent" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Overall Conversion</p>
            <p className="text-2xl font-bold text-success">10.0%</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Total Drop-off</p>
            <p className="text-2xl font-bold text-destructive">90.0%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
