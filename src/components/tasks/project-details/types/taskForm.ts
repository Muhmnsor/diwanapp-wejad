
import { ProjectMember } from "../hooks/useProjectMembers";

export type TaskFormData = {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  stageId: string;
  assignedTo: string;
  attachments: { url: string; name: string; type: string }[];
};

export interface TaskFormProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  priority: string;
  setPriority: (value: string) => void;
  dueDate: Date | null;
  setDueDate: (date: Date | null) => void;
  stageId: string;
  setStageId: (value: string) => void;
  assignedTo: string;
  setAssignedTo: (value: string) => void;
  attachments: { url: string; name: string; type: string }[];
  setAttachments: React.Dispatch<React.SetStateAction<{ url: string; name: string; type: string }[]>>;
  projectStages: { id: string; name: string }[];
  projectMembers: ProjectMember[];
}
