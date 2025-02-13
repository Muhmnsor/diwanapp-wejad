
import { BaseEventData } from './shared';

export interface Project extends BaseEventData {
  id: string;
  start_date: string;
  end_date: string;
  is_visible?: boolean;
  attendance_requirement_type?: string;
  project_type?: string;
}
