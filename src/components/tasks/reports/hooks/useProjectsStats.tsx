
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectsStats = (selectedProjectId: string) => {
  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('project_tasks')
      .select('id, title, description, status, created_at, due_date, workspace_id');
      
    if (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
    
    return data || [];
  };
  
  const projectsQuery = useQuery({
    queryKey: ['projects-list'],
    queryFn: fetchProjects
  });
  
  const statsQuery = useQuery({
    queryKey: ['projects-stats', selectedProjectId],
    queryFn: async () => {
      // Get projects
      let projects;
      if (selectedProjectId === 'all') {
        projects = projectsQuery.data;
      } else {
        projects = projectsQuery.data?.filter(p => p.id === selectedProjectId) || [];
      }
      
      if (!projects || projects.length === 0) {
        return {
          overview: {
            totalProjects: 0,
            completedProjects: 0,
            inProgressProjects: 0,
            delayedProjects: 0
          },
          projectsStatus: [],
          projectsProgress: [],
          tasksDistribution: [],
          taskAssignments: [],
          projectsDetails: []
        };
      }
      
      const projectIds = projects.map(p => p.id);
      
      // Fetch tasks for the selected projects
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .in('project_id', projectIds);
        
      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        throw tasksError;
      }
      
      // Calculate overview stats
      const totalProjects = projects.length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const inProgressProjects = projects.filter(p => p.status === 'in_progress').length;
      
      // Check for delayed projects (due date passed but not completed)
      const now = new Date();
      const delayedProjects = projects.filter(p => {
        if (!p.due_date || p.status === 'completed') return false;
        return new Date(p.due_date) < now;
      }).length;
      
      // Projects status distribution
      const projectsStatus = [
        { name: 'مكتملة', value: completedProjects, color: '#10b981' },
        { name: 'قيد التنفيذ', value: inProgressProjects, color: '#3b82f6' },
        { name: 'متأخرة', value: delayedProjects, color: '#ef4444' },
        { name: 'معلقة', value: totalProjects - completedProjects - inProgressProjects - delayedProjects, color: '#f59e0b' }
      ].filter(item => item.value > 0);
      
      // Calculate project progress
      const projectsProgress = projects
        .map(project => {
          const projectTasks = tasks?.filter(t => t.project_id === project.id) || [];
          const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
          const progress = projectTasks.length > 0 
            ? Math.round((completedTasks / projectTasks.length) * 100) 
            : 0;
          
          return {
            name: project.title,
            progress
          };
        })
        .sort((a, b) => b.progress - a.progress);
      
      // Tasks distribution by status
      const allProjectsTasksByStatus = projects.map(project => {
        const projectTasks = tasks?.filter(t => t.project_id === project.id) || [];
        const completed = projectTasks.filter(t => t.status === 'completed').length;
        const pending = projectTasks.filter(t => t.status === 'pending').length;
        const overdue = projectTasks.filter(t => {
          if (!t.due_date || t.status === 'completed') return false;
          return new Date(t.due_date) < now;
        }).length;
        
        return {
          name: project.title,
          completed,
          pending,
          overdue
        };
      });
      
      // Task assignments to team members
      const assignees = [...new Set((tasks || []).map(t => t.assigned_to).filter(Boolean))];
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', assignees);
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }
      
      const assignmentCounts = assignees.map(assigneeId => {
        const assigneeTasks = tasks?.filter(t => t.assigned_to === assigneeId).length || 0;
        const profile = profiles?.find(p => p.id === assigneeId);
        const name = profile?.display_name || profile?.email || 'Unknown';
        
        return {
          name,
          value: assigneeTasks
        };
      });
      
      // Add color property to task assignments
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
      const taskAssignments = assignmentCounts
        .filter(a => a.value > 0)
        .map((assignment, index) => ({
          ...assignment,
          color: colors[index % colors.length]
        }));
      
      // Project details
      const projectsDetails = projects.map(project => {
        const projectTasks = tasks?.filter(t => t.project_id === project.id) || [];
        const totalTasks = projectTasks.length;
        const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
        const completionPercentage = totalTasks > 0 
          ? Math.round((completedTasks / totalTasks) * 100) 
          : 0;
        
        const overdueTasks = projectTasks.filter(t => {
          if (!t.due_date || t.status === 'completed') return false;
          return new Date(t.due_date) < now;
        }).length;
        
        // Determine status
        let status = project.status || 'pending';
        if (completionPercentage === 100) {
          status = 'completed';
        } else if (overdueTasks > 0) {
          status = 'delayed';
        } else if (completedTasks > 0) {
          status = 'in_progress';
        }
        
        return {
          id: project.id,
          title: project.title,
          completionPercentage,
          completedTasks,
          totalTasks,
          overdueTasks,
          status
        };
      });
      
      // Sort by completion percentage
      projectsDetails.sort((a, b) => b.completionPercentage - a.completionPercentage);
      
      return {
        overview: {
          totalProjects,
          completedProjects,
          inProgressProjects,
          delayedProjects
        },
        projectsStatus,
        projectsProgress,
        tasksDistribution: allProjectsTasksByStatus,
        taskAssignments,
        projectsDetails
      };
    },
    enabled: !!projectsQuery.data
  });
  
  return {
    data: statsQuery.data || {
      overview: {
        totalProjects: 0,
        completedProjects: 0,
        inProgressProjects: 0,
        delayedProjects: 0
      },
      projectsStatus: [],
      projectsProgress: [],
      tasksDistribution: [],
      taskAssignments: [],
      projectsDetails: []
    },
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading || statsQuery.isLoading,
    error: projectsQuery.error || statsQuery.error
  };
};
