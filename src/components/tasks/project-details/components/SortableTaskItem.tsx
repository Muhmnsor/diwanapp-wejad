
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types/task';
import { TaskItem } from './TaskItem';
import { GripVertical } from 'lucide-react';

interface SortableTaskItemProps {
  id: string;
  task: Task;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
  isDragging: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export const SortableTaskItem = ({ 
  id, 
  task, 
  getStatusBadge, 
  getPriorityBadge, 
  formatDate, 
  onStatusChange, 
  projectId,
  isDragging,
  onEdit,
  onDelete
}: SortableTaskItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      <TaskItem 
        task={task} 
        getStatusBadge={getStatusBadge} 
        getPriorityBadge={getPriorityBadge} 
        formatDate={formatDate} 
        onStatusChange={onStatusChange}
        projectId={projectId}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};
