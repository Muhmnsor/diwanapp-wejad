
import { useState, useEffect } from 'react';
import { WorkspaceWithProjects, ProjectWithTasks, YearlyPlanFilters } from '../types/yearlyPlanTypes';
import { Task, Workspace, Project } from '@/types/workspace';
import { startOfMonth, addMonths, isBefore } from 'date-fns';

export const useYearlyPlanData = (year: number) => {
  const [workspaces, setWorkspaces] = useState<WorkspaceWithProjects[]>([]);
  const [filters, setFilters] = useState<YearlyPlanFilters>({
    status: null,
    workspace: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Generate months for the selected year
  const getMonthsOfYear = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(startOfMonth(new Date(year, i, 1)));
    }
    return months;
  };

  // Fetch demo data
  useEffect(() => {
    setIsLoading(true);

    // هذه بيانات تجريبية، ستُستبدل بجلب البيانات الفعلية من قاعدة البيانات
    const fetchDemoData = () => {
      const demoWorkspaces: Workspace[] = [
        {
          id: '1',
          name: 'مساحة العمل الرئيسية',
          description: 'المساحة الرئيسية للمشاريع الاستراتيجية',
          status: 'active',
          created_at: new Date().toISOString(),
          total_tasks: 12,
          completed_tasks: 5,
          pending_tasks: 7,
        },
        {
          id: '2',
          name: 'تطوير المنتجات',
          description: 'مساحة خاصة بتطوير المنتجات الجديدة',
          status: 'active',
          created_at: new Date().toISOString(),
          total_tasks: 8,
          completed_tasks: 3,
          pending_tasks: 5,
        },
        {
          id: '3',
          name: 'المشاريع التعليمية',
          description: 'مساحة للمشاريع التعليمية والتدريبية',
          status: 'active',
          created_at: new Date().toISOString(),
          total_tasks: 5,
          completed_tasks: 2,
          pending_tasks: 3,
        }
      ];
      
      // إنشاء المشاريع التجريبية
      const demoProjects: Project[] = [];
      for (let i = 0; i < 8; i++) {
        const randomWorkspace = demoWorkspaces[Math.floor(Math.random() * demoWorkspaces.length)];
        const randomMonth = Math.floor(Math.random() * 10); // لضمان أن المشروع لا ينتهي بعد نهاية العام
        const randomDay = Math.floor(Math.random() * 20) + 1;
        const randomDuration = Math.floor(Math.random() * 60) + 30; // مدة المشروع من 30 إلى 90 يوم
        
        const startDate = new Date(year, randomMonth, randomDay);
        const endDate = new Date(year, randomMonth, randomDay + randomDuration);
        
        const statuses: Project['status'][] = ['pending', 'in_progress', 'completed', 'delayed', 'stopped'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        demoProjects.push({
          id: `project-${i+1}`,
          name: `مشروع ${i+1}`,
          description: `وصف المشروع رقم ${i+1}`,
          status: randomStatus,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          created_at: new Date(year, randomMonth, randomDay - 10).toISOString(),
          workspace_id: randomWorkspace.id,
        });
      }
      
      // إنشاء مهام تجريبية للمشاريع
      const demoTasks: Task[] = [];
      demoProjects.forEach(project => {
        const projectStartDate = new Date(project.start_date!);
        const projectEndDate = new Date(project.end_date!);
        
        // إنشاء 3-7 مهام لكل مشروع
        const tasksCount = Math.floor(Math.random() * 5) + 3;
        
        for (let i = 0; i < tasksCount; i++) {
          // توزيع المهام على فترة المشروع
          const taskOffset = Math.floor((projectEndDate.getTime() - projectStartDate.getTime()) * (i / tasksCount));
          const taskDuration = Math.floor(Math.random() * 14) + 3; // مدة المهمة من 3 إلى 16 يوم
          
          const taskStartDate = new Date(projectStartDate.getTime() + taskOffset);
          const taskEndDate = new Date(taskStartDate.getTime() + (taskDuration * 24 * 60 * 60 * 1000));
          
          // تأكد من أن تاريخ انتهاء المهمة لا يتجاوز تاريخ انتهاء المشروع
          const finalEndDate = isBefore(taskEndDate, projectEndDate) ? taskEndDate : projectEndDate;
          
          demoTasks.push({
            id: `task-${project.id}-${i+1}`,
            title: `مهمة ${i+1} للمشروع ${project.id}`,
            description: `وصف المهمة رقم ${i+1} للمشروع ${project.id}`,
            status: ['pending', 'in_progress', 'completed'][Math.floor(Math.random() * 3)] as 'pending' | 'in_progress' | 'completed',
            priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
            due_date: finalEndDate.toISOString(),
            created_at: new Date(taskStartDate.getTime() - (5 * 24 * 60 * 60 * 1000)).toISOString(),
            workspace_id: project.workspace_id,
            project_id: project.id,
            start_date: taskStartDate.toISOString(),
            end_date: finalEndDate.toISOString()
          });
        }
      });

      // تحويل المشاريع إلى الصيغة المطلوبة مع المهام المرتبطة بها
      const projectsWithTasks: ProjectWithTasks[] = demoProjects.map(project => {
        const projectTasks = demoTasks.filter(task => task.project_id === project.id);
        const completedTasks = projectTasks.filter(task => task.status === 'completed');
        const overdueTasks = projectTasks.filter(task => {
          return task.status !== 'completed' && task.due_date && new Date(task.due_date) < new Date();
        });
        
        return {
          ...project,
          tasks: projectTasks,
          expanded: false,
          completedTasksCount: completedTasks.length,
          totalTasksCount: projectTasks.length,
          overdueTasksCount: overdueTasks.length,
          completionPercentage: projectTasks.length > 0 
            ? Math.round((completedTasks.length / projectTasks.length) * 100) 
            : 0
        };
      });

      // تجميع المشاريع حسب مساحة العمل
      const workspacesWithProjects: WorkspaceWithProjects[] = demoWorkspaces.map(workspace => {
        const workspaceProjects = projectsWithTasks.filter(project => project.workspace_id === workspace.id);
        
        return {
          ...workspace,
          projects: workspaceProjects,
          expanded: true
        };
      });

      setWorkspaces(workspacesWithProjects);
      setIsLoading(false);
    };

    fetchDemoData();
  }, [year]);

  // تطبيق الفلاتر على البيانات
  const filteredWorkspaces = workspaces.map(workspace => {
    if (filters.workspace && filters.workspace !== workspace.id) {
      return { ...workspace, projects: [] };
    }

    const filteredProjects = workspace.projects.filter(project => {
      if (filters.status && project.status !== filters.status) {
        return false;
      }
      return true;
    });

    return { ...workspace, projects: filteredProjects };
  }).filter(workspace => workspace.projects.length > 0 || !filters.workspace);

  // تبديل حالة توسيع مساحة العمل
  const toggleWorkspaceExpanded = (workspaceId: string) => {
    setWorkspaces(prevWorkspaces => 
      prevWorkspaces.map(workspace => 
        workspace.id === workspaceId 
          ? { ...workspace, expanded: !workspace.expanded } 
          : workspace
      )
    );
  };

  // تبديل حالة توسيع المشروع
  const toggleProjectExpanded = (projectId: string) => {
    setWorkspaces(prevWorkspaces => 
      prevWorkspaces.map(workspace => ({
        ...workspace,
        projects: workspace.projects.map(project => 
          project.id === projectId 
            ? { ...project, expanded: !project.expanded } 
            : project
        )
      }))
    );
  };

  return {
    workspaces: filteredWorkspaces,
    months: getMonthsOfYear(),
    isLoading,
    filters,
    setFilters,
    toggleWorkspaceExpanded,
    toggleProjectExpanded
  };
};
