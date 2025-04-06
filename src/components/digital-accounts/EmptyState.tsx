
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  message: string;
}

export const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
      <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-500 text-center">{message}</p>
    </div>
  );
};
