import { LucideIcon } from "lucide-react";

interface ProjectCardStatusProps {
  status: {
    status: string;
    label: string;
    icon: LucideIcon;
    color: string;
  };
}

export const ProjectCardStatus = ({ status }: ProjectCardStatusProps) => {
  return (
    <div className={`${status.color} text-white px-2 py-1 rounded-md text-sm flex items-center gap-1 mt-2`}>
      <status.icon className="w-4 h-4" />
      {status.label}
    </div>
  );
};