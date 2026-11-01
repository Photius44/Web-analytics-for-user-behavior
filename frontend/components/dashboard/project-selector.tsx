"use client";

import { useProject, Project } from "@/context/ProjectContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, FolderKanban, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProjectSelector() {
  const { projects, selectedProject, setSelectedProject, isLoading } = useProject();

  if (isLoading) {
    return (
      <div className="h-9 w-48 animate-pulse rounded-md bg-secondary border border-border" />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-border bg-secondary hover:bg-secondary/80 max-w-[220px]"
          id="project-selector-trigger"
        >
          <FolderKanban className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate text-sm font-medium">
            {selectedProject?.name ?? "Select Project"}
          </span>
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
          Switch Project
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects.map((project: Project) => {
          const isActive = selectedProject?.id === project.id;
          return (
            <DropdownMenuItem
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={cn(
                "flex items-start gap-3 py-2.5 cursor-pointer",
                isActive && "bg-primary/10 text-primary focus:bg-primary/15 focus:text-primary"
              )}
              id={`project-option-${project.id}`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary border border-border">
                <FolderKanban className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{project.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {project.domain ?? project.id}
                </p>
              </div>
              {isActive && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
