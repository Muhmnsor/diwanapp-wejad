export type EventStatus = 'available' | 'full' | 'ended' | 'notStarted' | 'eventStarted';

export interface EventStatusConfig {
  text: string;
  variant: string;
  color: string;
  textColor: string;
}

export interface RegistrationStatusConfig {
  text?: string;
  badge?: {
    text: string;
    className: string;
  };
}

export interface EventDates {
  eventDate: Date;
  registrationStartDate: Date | null;
  registrationEndDate: Date | null;
}