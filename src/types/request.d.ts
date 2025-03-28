
// This file extends the request types for the application
import { RequestStatus } from './meeting';

// Re-export the RequestStatus type to make it available from this file
export type { RequestStatus };

// Define a helper function to validate request status
export function isValidRequestStatus(status: string): status is RequestStatus {
  return ['pending', 'in_progress', 'approved', 'rejected', 'completed', 'cancelled'].includes(status);
}
