
export interface CopyProgress {
  progress: number;
  step: string;
}

export interface CopyProjectState {
  isLoading: boolean;
  copyProgress: number;
  copyStep: string;
  isComplete: boolean;
  error: string | null;
  newProjectId: string | null;
}

export interface UseCopyProjectProps {
  projectId: string;
  newTitle: string;
  includeTasks: boolean;
  includeAttachments: boolean;
  includeStages: boolean;
  onSuccess: () => void;
  onClose: () => void;
}
