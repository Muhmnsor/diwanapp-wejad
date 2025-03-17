
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  location?: string;
  meeting_type: string;
  status: string;
  start_time: string;
  end_time: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
}

export interface MeetingAgendaItem {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  order_number: number;
  duration?: number;
  presenter?: string;
  status: string;
  created_at: string;
}

export interface MeetingMinutes {
  id: string;
  meeting_id: string;
  content: string;
  status: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  creator?: {
    display_name?: string;
    email?: string;
  };
}
