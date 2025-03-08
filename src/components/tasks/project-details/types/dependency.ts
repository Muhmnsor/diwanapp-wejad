
/**
 * Defines the valid dependency types between tasks
 */
export type DependencyType = 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';

/**
 * Interface for dependency data from the database
 */
export interface DependencyData {
  id: string;
  task_id: string;
  dependency_task_id: string;
  dependency_type: DependencyType;
  created_at: string;
}
