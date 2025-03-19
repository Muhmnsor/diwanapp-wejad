
export interface MeetingFolder {
  id: string;
  name: string;
  type: string;
  description?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

// Update Meeting interface in the existing meeting.ts file
// This is just for reference, we can't directly modify the original file
export interface MeetingWithFolder extends Meeting {
  folder_id?: string;
}
