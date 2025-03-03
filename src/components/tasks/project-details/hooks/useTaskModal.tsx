
import { create } from 'zustand';

type TaskModalStore = {
  isOpen: boolean;
  taskId: string | null;
  onOpen: (taskId: string) => void;
  onClose: () => void;
};

export const useTaskModal = create<TaskModalStore>((set) => ({
  isOpen: false,
  taskId: null,
  onOpen: (taskId) => set({ isOpen: true, taskId }),
  onClose: () => set({ isOpen: false, taskId: null }),
}));
