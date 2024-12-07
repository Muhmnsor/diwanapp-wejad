import { create } from 'zustand';

export interface Event {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
}

interface EventStore {
  events: Event[];
  addEvent: (event: Event) => void;
}

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
}));