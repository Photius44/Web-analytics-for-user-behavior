"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Project {
  id: string;
  name: string;
  domain: string | null;
  createdAt: string;
}

interface ProjectContextValue {
  projects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (project: Project) => void;
  isLoading: boolean;
  refreshProjects: () => Promise<Project[]>;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

const STORAGE_KEY = "analytics_selected_project_id";

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProjectState] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to fetch projects from backend or load fallback
  const fetchProjects = async (): Promise<Project[]> => {
    try {
      const res = await fetch("http://localhost:5000/api/analytics/projects");
      if (!res.ok) {
        throw new Error(`Failed to load projects (HTTP ${res.status})`);
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setProjects(json.data);
        return json.data;
      }
    } catch (err: any) {
      console.warn("[ProjectContext] Backend offline or unreachable:", err.message);
      // Fallback project so pages don't break if backend is offline
      const fallback: Project = {
        id: "test-project-1234",
        name: "Default Project (Offline)",
        domain: null,
        createdAt: new Date().toISOString(),
      };
      setProjects([fallback]);
      return [fallback];
    }
    return [];
  };

  // Fetch all projects on mount
  useEffect(() => {
    fetchProjects()
      .then((data) => {
        if (data && data.length > 0) {
          // Restore previously selected project from localStorage, else default to first
          const savedId = localStorage.getItem(STORAGE_KEY);
          const restored = data.find((p: Project) => p.id === savedId);
          setSelectedProjectState(restored || data[0]);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const refreshProjects = async (): Promise<Project[]> => {
    return await fetchProjects();
  };

  const setSelectedProject = (project: Project) => {
    setSelectedProjectState(project);
    localStorage.setItem(STORAGE_KEY, project.id);
  };

  return (
    <ProjectContext.Provider value={{ projects, selectedProject, setSelectedProject, isLoading, refreshProjects }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    // Return a safe fallback during SSR / static prerender
    return {
      projects: [],
      selectedProject: null,
      setSelectedProject: () => {},
      isLoading: true,
      refreshProjects: async () => [],
    };
  }
  return ctx;
}
