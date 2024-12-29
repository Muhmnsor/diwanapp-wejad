export type EventStatus = 'available' | 'full' | 'ended' | 'notStarted' | 'eventStarted';

export interface EventStatusConfig {
  text: string;
  className: string;
  disabled: boolean;
}

export interface EventDates {
  eventDate: Date;
  registrationStartDate: Date | null;
  registrationEndDate: Date | null;
}