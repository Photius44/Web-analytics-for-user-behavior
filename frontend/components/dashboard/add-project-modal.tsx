"use client";

import React, { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Globe,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Terminal,
  ArrowRight,
  FolderOpen
} from "lucide-react";

export function AddProjectModal() {
  const { refreshProjects, setSelectedProject } = useProject();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdProject, setCreatedProject] = useState<{ id: string; name: string; domain: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setName("");
    setDomain("");
    setStep("form");
    setCreatedProject(null);
    setCopied(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Delay reset so form doesn't snap while closing
      setTimeout(resetForm, 300);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a project name.",
        variant: "destructive",
      });
      return;
    }

    if (!domain.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a website URL or domain.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          domain: domain.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create project");
      }

      const newProjectData = result.data;
      setCreatedProject(newProjectData);

      // Refresh project list inside ProjectContext
      const updatedProjects = await refreshProjects();
      
      // Auto-select the newly created project in the workspace
      const matched = updatedProjects.find((p) => p.id === newProjectData.id);
      if (matched) {
        setSelectedProject(matched);
      }

      toast({
        title: "Success! 🎉",
        description: `Project "${newProjectData.name}" created successfully.`,
      });

      // Move to integration snippet screen
      setStep("success");
    } catch (err: any) {
      console.error("[AddProjectModal Error]:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to connect to analytics server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const trackerScriptCode = createdProject
    ? `<script\n  src="http://localhost:5000/tracker.js"\n  data-project-id="${createdProject.id}"\n  async\n></script>`
    : "";

  const handleCopyCode = async () => {
    if (!trackerScriptCode) return;
    try {
      await navigator.clipboard.writeText(trackerScriptCode);
      setCopied(true);
      toast({
        title: "Code Copied!",
        description: "Tracker script copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-200"
          id="add-project-btn"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Add Project</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md border-border bg-card shadow-2xl overflow-hidden rounded-xl">
        {step === "form" ? (
          <>
            <DialogHeader className="space-y-1">
              <div className="flex items-center gap-2 text-violet-500 font-semibold text-sm uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                <span>SaaS Administration</span>
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                Create New Project
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Add a new website to your analytics account to begin tracking pageviews, user clicks, and custom events.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="project-name" className="text-sm font-semibold text-foreground">
                  Project Name
                </Label>
                <div className="relative">
                  <FolderOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="project-name"
                    placeholder="e.g. ACME Book Shop"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-secondary/30 border-border focus:border-indigo-500 focus-visible:ring-indigo-500/20"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-domain" className="text-sm font-semibold text-foreground">
                  Website URL / Domain
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="project-domain"
                    placeholder="e.g. acme-shop.com or localhost:8080"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="pl-10 bg-secondary/30 border-border focus:border-indigo-500 focus-visible:ring-indigo-500/20"
                    disabled={isLoading}
                    required
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Do not worry if you paste a full URL; we will automatically strip the path and extract the base domain.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isLoading}
                  className="border-border hover:bg-secondary"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader className="space-y-1">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-2">
                <Check className="h-6 w-6 stroke-[3]" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight text-center text-foreground">
                Project Created Successfully!
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground text-sm">
                Project ID: <code className="px-1.5 py-0.5 rounded bg-secondary text-indigo-400 font-mono text-xs font-semibold">{createdProject?.id}</code>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Tracker Script Installation</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    onClick={handleCopyCode}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
                
                <div className="relative">
                  <pre className="text-[11px] font-mono leading-relaxed bg-black/60 text-indigo-300 p-3.5 rounded border border-border/40 overflow-x-auto whitespace-pre select-all">
                    {trackerScriptCode}
                  </pre>
                </div>

                <p className="text-xs text-muted-foreground leading-normal">
                  Copy and paste this script tag inside the <code className="text-indigo-400 font-mono text-[11px] font-semibold">&lt;head&gt;</code> element of your website. Once installed, it will automatically record sessions, page views, and click coordinate heatmaps.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  className="w-full gap-2 border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/5"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied Code
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Script Tag
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleOpenChange(false)}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white gap-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
