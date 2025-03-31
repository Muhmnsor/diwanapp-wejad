
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Briefcase, Building } from "lucide-react";

interface EmployeeStatsProps {
  stats: {
    totalEmployees: number;
    activeCount: number;
    departmentCount: number;
    positionCount: number;
    byDepartment?: { name: string; count: number }[];
    byPosition?: { name: string; count: number }[];
    byContractType?: { name: string; count: number }[];
  };
}

export function EmployeeStats({ stats }: EmployeeStatsProps) {
  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الموظفين</p>
              <h3 className="text-2xl font-bold">{stats.totalEmployees}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">الموظفين النشطين</p>
              <h3 className="text-2xl font-bold">{stats.activeCount}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {((stats.activeCount / stats.totalEmployees) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">الأقسام</p>
              <h3 className="text-2xl font-bold">{stats.departmentCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Building className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
