
import { MeetingTask } from "../types";
import { UseMutateFunction } from "@tanstack/react-query";

// Define the type of the update function returned by useMeetingDetails
type UpdateTaskMutation = UseMutateFunction<
  any, 
  Error, 
  { id: string; status: MeetingTask['status'] },
  unknown
>;

// Define the type of the function expected by MeetingTasksPanel
type TaskUpdaterFunction = (id: string, updates: Partial<MeetingTask>) => void;

/**
 * This hook adapts the task update mutation function to match 
 * the signature expected by the MeetingTasksPanel component
 */
export const useTaskUpdater = (
  updateTask: UpdateTaskMutation
): TaskUpdaterFunction => {
  // Return a function that converts parameters to match what the mutation expects
  return (id: string, updates: Partial<MeetingTask>) => {
    // Only proceed if there's a status update
    if (updates.status) {
      // Call the updateTask function with the properly formatted parameters
      updateTask({ 
        id, 
        status: updates.status
      });
    } else {
      console.warn('Task update called without status change');
    }
  };
};
