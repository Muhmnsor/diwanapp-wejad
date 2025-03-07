
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface WorkspaceContextType {
  workspaceId: string | null;
  setWorkspaceId: (id: string | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  // Load workspace ID from localStorage on mount
  useEffect(() => {
    const storedWorkspaceId = localStorage.getItem('currentWorkspaceId');
    if (storedWorkspaceId) {
      setWorkspaceId(storedWorkspaceId);
    }
  }, []);

  // Save workspace ID to localStorage when it changes
  useEffect(() => {
    if (workspaceId) {
      localStorage.setItem('currentWorkspaceId', workspaceId);
    } else {
      localStorage.removeItem('currentWorkspaceId');
    }
  }, [workspaceId]);

  return (
    <WorkspaceContext.Provider value={{ workspaceId, setWorkspaceId }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
