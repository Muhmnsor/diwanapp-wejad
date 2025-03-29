
import { Card, CardContent } from "@/components/ui/card";
import { Template } from "./types/template";

interface TemplateStatsProps {
  templates: Template[];
}

export const TemplateStats = ({ templates }: TemplateStatsProps) => {
  // Calculate stats
  const totalTemplates = templates.length;
  
  // Group by department
  const departmentCounts: Record<string, number> = {};
  templates.forEach(template => {
    if (template.department) {
      departmentCounts[template.department] = (departmentCounts[template.department] || 0) + 1;
    }
  });
  
  // Get top 3 departments
  const topDepartments = Object.entries(departmentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
    
  // Calculate total downloads
  const totalDownloads = templates.reduce((sum, template) => sum + (template.downloads || 0), 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">إجمالي النماذج</p>
            <p className="text-3xl font-bold">{totalTemplates}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">إجمالي التنزيلات</p>
            <p className="text-3xl font-bold">{totalDownloads}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">الإدارات الأكثر نماذج</p>
            <div className="space-y-1 mt-2">
              {topDepartments.length > 0 ? (
                topDepartments.map(([dept, count]) => (
                  <div key={dept} className="flex justify-between items-center text-sm">
                    <span className="font-medium truncate">{dept}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground">لا توجد إدارات</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">متوسط التنزيلات لكل نموذج</p>
            <p className="text-3xl font-bold">
              {totalTemplates > 0 ? (totalDownloads / totalTemplates).toFixed(1) : "0"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
