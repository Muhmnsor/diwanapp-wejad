import { create } from 'zustand';

export interface Event {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  attendees: number;
  maxAttendees: number;
  eventType: "online" | "in-person";
  price: number | "free";
}

interface EventStore {
  events: Event[];
  addEvent: (event: Event) => void;
  updateEvent: (index: number, event: Event) => void;
}

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  updateEvent: (index, updatedEvent) => 
    set((state) => ({
      events: state.events.map((event, i) => 
        i === index ? { ...event, ...updatedEvent } : event
      )
    })),
}));