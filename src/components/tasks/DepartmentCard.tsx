import { useState } from "react";
import { Department } from "@/types/department";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Building2 } from "lucide-react";
import { ProjectsList } from "./ProjectsList";

interface DepartmentCardProps {
  department: Department;
}

export const DepartmentCard = ({ department }: DepartmentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="p-6">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{department.name}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </div>

      {isExpanded && department.department_projects && (
        <div className="mt-4 pr-6 border-r border-gray-200">
          <ProjectsList projects={department.department_projects} />
        </div>
      )}
    </Card>
  );
};