
import { Meeting, MeetingAgendaItem, MeetingParticipant } from "@/components/meetings/types";

// Create a type that matches what NewMeetingDialog expects (with optional title)
export interface MeetingFormAgendaItem {
  order_number: number;
  title?: string;
  description?: string;
}

// Create a type adapter that enforces title is required when saving to database
export function validateAndConvertAgendaItems(items: MeetingFormAgendaItem[]): Omit<MeetingAgendaItem, 'id' | 'meeting_id' | 'created_at' | 'updated_at'>[] {
  return items
    .filter(item => item.title && item.title.trim() !== '')
    .map((item, index) => ({
      title: item.title || `Item ${index + 1}`, // Provide default title if missing
      description: item.description,
      order_number: item.order_number || index + 1
    }));
}

// Fix for the participants field
export interface ParticipantSelection {
  id: string; // This represents the user_id in the UI selection
  role: MeetingParticipant['role'];
}

export function convertParticipantsToMeetingFormat(
  participants: ParticipantSelection[]
): { user_id: string; role: MeetingParticipant['role'] }[] {
  return participants.map(p => ({
    user_id: p.id,
    role: p.role
  }));
}

// Helper for form error display
export function formatFormError(error: any): React.ReactNode {
  if (typeof error === 'string') return error;
  if (error && typeof error.message === 'string') return error.message;
  return 'Invalid input';
}
