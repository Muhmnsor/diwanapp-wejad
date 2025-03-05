
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectsOverviewStats } from "./components/ProjectsOverviewStats";
import { ProjectsStatusChart } from "./components/ProjectsStatusChart";
import { ProjectsProgressChart } from "./components/ProjectsProgressChart";
import { ProjectTasksDistributionChart } from "./components/ProjectTasksDistributionChart";
import { TaskAssignmentDistributionChart } from "./components/TaskAssignmentDistributionChart";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectsStats } from "./hooks/useProjectsStats";

export const ProjectTasksReports = () => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const { data, projects, isLoading } = useProjectsStats(selectedProject);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">تقارير المشاريع</h3>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <select 
            className="px-3 py-1 border rounded-md text-sm"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="all">جميع المشاريع</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <ProjectsOverviewStats stats={data.overview} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">حالة المشاريع</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectsStatusChart data={data.projectsStatus} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">نسبة الإنجاز</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectsProgressChart data={data.projectsProgress} />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">المهام المعلقة والمكتملة</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectTasksDistributionChart data={data.tasksDistribution} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">توزيع المهام على الأعضاء</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskAssignmentDistributionChart data={data.taskAssignments} />
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">تفاصيل المشاريع</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-right border">المشروع</th>
                <th className="p-2 text-right border">نسبة الإنجاز</th>
                <th className="p-2 text-right border">المهام المكتملة</th>
                <th className="p-2 text-right border">المهام الكلية</th>
                <th className="p-2 text-right border">المهام المتأخرة</th>
                <th className="p-2 text-right border">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {data.projectsDetails.map((project, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-2 border">{project.title}</td>
                  <td className="p-2 border">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${project.completionPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 inline-block">
                      {project.completionPercentage}%
                    </span>
                  </td>
                  <td className="p-2 border">{project.completedTasks}</td>
                  <td className="p-2 border">{project.totalTasks}</td>
                  <td className="p-2 border">{project.overdueTasks}</td>
                  <td className="p-2 border">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'delayed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status === 'completed' ? 'مكتمل' :
                       project.status === 'in_progress' ? 'قيد التنفيذ' :
                       project.status === 'delayed' ? 'متأخر' :
                       'معلق'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
