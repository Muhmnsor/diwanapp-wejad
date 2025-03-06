
import { useAuthStore } from "@/store/authStore";

interface UseTaskPermissionsProps {
  taskId: string;
  assignedTo?: string | null;
  createdBy?: string | null;
}

export const useTaskPermissions = ({
  taskId,
  assignedTo,
  createdBy
}: UseTaskPermissionsProps) => {
  const { user } = useAuthStore();
  
  // Check if user is admin
  const isAdmin = user?.isAdmin || user?.role === 'admin';
  
  // Check if user is the creator of the task
  const isCreator = user?.id === createdBy;
  
  // Check if user is assigned to the task
  const isAssigned = user?.id === assignedTo;
  
  // Permission checks
  const canEdit = isAdmin || isCreator;
  const canDelete = isAdmin || isCreator;
  const canChangeStatus = isAdmin || isCreator || isAssigned;
  
  return {
    canEdit,
    canDelete,
    canChangeStatus,
    isAdmin,
    isCreator,
    isAssigned
  };
};
