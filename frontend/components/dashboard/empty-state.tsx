"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Code, Copy, Check, Terminal, Play } from "lucide-react";

interface EmptyStateProps {
  projectId: string;
  domain: string;
  title?: string;
}

export function EmptyState({ projectId, domain, title = "Waiting for data..." }: EmptyStateProps) {
  const [copied, setCopied] = useState(false);

  const trackerCode = `<script 
  src="http://localhost:5000/tracker.js" 
  data-project-id="${projectId}" 
  async>
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(trackerCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl bg-secondary/15 backdrop-blur-[2px] max-w-4xl mx-auto my-10 space-y-8 animate-fade-in">
      <div className="flex flex-col items-center text-center space-y-3 max-w-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20 animate-pulse">
          <Terminal className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          No events or sessions have been tracked yet for <span className="font-semibold text-foreground">{domain}</span>. 
          To start monitoring user behavior in real-time, integrate the tracking snippet onto your site.
        </p>
      </div>

      {/* Setup Guide Card */}
      <Card className="w-full bg-card/60 border-border/80 backdrop-blur-md shadow-xl">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Code className="h-4 w-4 text-primary" />
            Integrate Tracking Code
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Add this lightweight script into the <code className="px-1.5 py-0.5 rounded bg-secondary font-mono text-foreground">&lt;head&gt;</code> block of your website:
          </p>

          <div className="relative rounded-lg border border-border bg-black/90 p-4 font-mono text-xs text-zinc-300 overflow-x-auto shadow-inner">
            <pre>{trackerCode}</pre>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 h-7 w-7 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-primary/10 bg-primary/5 px-4 py-3 text-xs text-primary leading-normal">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <div>
              <span className="font-semibold">Local Verification:</span> Open your client website (e.g. <span className="underline font-mono">http://localhost:8080</span> or <span className="underline font-mono">http://localhost:5173</span>) in a browser, scroll, click, and interact to populate analytics data immediately.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
