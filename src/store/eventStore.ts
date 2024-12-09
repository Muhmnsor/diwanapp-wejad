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
  deleteEvent: (index: number) => void;
}

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  addEvent: (event) => set((state) => ({ 
    events: [...state.events, event] 
  })),
  updateEvent: (index, updatedEvent) => {
    console.log('Updating event at index:', index);
    console.log('Updated event data:', updatedEvent);
    
    set((state) => {
      const newEvents = [...state.events];
      newEvents[index] = updatedEvent;
      console.log('New events array:', newEvents);
      return { events: newEvents };
    });
  },
  deleteEvent: (index) => set((state) => {
    const newEvents = [...state.events];
    newEvents.splice(index, 1);
    return { events: newEvents };
  }),
}));