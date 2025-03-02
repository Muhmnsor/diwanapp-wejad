
import { DiscussionTimeState, IdeaUpdates } from "../types";

export interface FetchedIdeaData {
  discussion_period: string;
  created_at: string;
  status?: string;
}

export interface SubmitState {
  isSubmitting: boolean;
  isEndDialogOpen: boolean;
  setIsEndDialogOpen: (value: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleEndDiscussion: () => Promise<void>;
}

export interface TimeInputState {
  days: number;
  setDays: (value: number) => void;
  hours: number;
  setHours: (value: number) => void;
  operation: string;
  setOperation: (value: string) => void;
}

export interface TimeCalculationResult {
  remainingDays: number;
  remainingHours: number;
  totalCurrentHours: number;
}
