
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface SubtaskItemProps {
  subtask: {
    id: string;
    title: string;
    status: string;
    due_date: string | null;
    assigned_to: string | null;
  };
  onStatusChange: (subtaskId: string, newStatus: string) => Promise<void>;
  onDelete: (subtaskId: string) => Promise<void>;
}

export const SubtaskItem = ({ subtask, onStatusChange, onDelete }: SubtaskItemProps) => {
  const [isChecked, setIsChecked] = useState(subtask.status === "completed");
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleStatusToggle = async () => {
    try {
      const newStatus = isChecked ? "pending" : "completed";
      await onStatusChange(subtask.id, newStatus);
      setIsChecked(!isChecked);
    } catch (error) {
      console.error("Error toggling subtask status:", error);
    }
  };
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(subtask.id);
    } catch (error) {
      console.error("Error deleting subtask:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date to be more readable
  const formattedDate = subtask.due_date 
    ? new Date(subtask.due_date).toLocaleDateString('ar-SA') 
    : null;
  
  return (
    <div className={`flex items-start gap-2 p-2 rounded-md ${isChecked ? 'bg-muted/50' : 'bg-card hover:bg-muted/20'}`}>
      <Checkbox 
        checked={isChecked} 
        onCheckedChange={handleStatusToggle}
        className="mt-0.5" 
      />
      
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${isChecked ? 'line-through text-muted-foreground' : ''}`}>
          {subtask.title}
        </div>
        
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
          {formattedDate && (
            <span>تاريخ الاستحقاق: {formattedDate}</span>
          )}
          
          {subtask.assigned_to && (
            <span>
              {subtask.assigned_to.startsWith('custom:')
                ? `المكلف: ${subtask.assigned_to.replace('custom:', '')}`
                : `المكلف: ${subtask.assigned_to}`
              }
            </span>
          )}
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 h-7 w-7"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive"
            onClick={handleDelete}
          >
            تأكيد الحذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
