import { BeneficiaryType } from "./event";

export interface Project {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  max_attendees: number;
  image_url: string;
  event_type: "online" | "in-person";
  price: number | null;
  beneficiary_type: BeneficiaryType;
  certificate_type?: string;
  event_path?: string;
  event_category?: string;
  registration_start_date: string | null;
  registration_end_date: string | null;
}