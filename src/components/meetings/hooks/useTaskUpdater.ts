
import { MeetingTask } from "../types";
import { UseMutateFunction } from "@tanstack/react-query";

// This utility function wraps the updateTask mutation to match the expected signature
export const createTaskUpdater = (
  updateTaskMutation: UseMutateFunction<any, Error, { id: string; status: MeetingTask['status'] }, unknown>
): ((id: string, updates: Partial<MeetingTask>) => void) => {
  return (id: string, updates: Partial<MeetingTask>) => {
    if (updates.status) {
      updateTaskMutation({ id, status: updates.status });
    }
  };
};
