import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DepartmentCardProps {
  department: {
    id: string;
    name: string;
    description: string | null;
  };
}

export const DepartmentCard = ({ department }: DepartmentCardProps) => {
  return (
    <Link to={`/departments/${department.id}/projects`}>
      <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
        <CardHeader className="flex flex-row items-center gap-4">
          <Building2 className="h-8 w-8 text-primary" />
          <CardTitle className="text-lg">{department.name}</CardTitle>
        </CardHeader>
        {department.description && (
          <CardContent>
            <p className="text-sm text-gray-600 line-clamp-2">{department.description}</p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
};