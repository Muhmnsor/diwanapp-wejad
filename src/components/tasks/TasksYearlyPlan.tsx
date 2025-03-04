
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Project } from '@/types/project';
import { startOfMonth, addMonths, getMonth } from 'date-fns';
import { YearNavigation } from './yearly-plan/components/YearNavigation';
import { MonthsHeader } from './yearly-plan/components/MonthsHeader';
import { ProjectTasksRow } from './yearly-plan/components/ProjectTasksRow';
import { StatusLegend } from './yearly-plan/components/StatusLegend';
import { useProjects } from '@/hooks/useProjects';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const TasksYearlyPlan = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('all');
  const today = new Date();
  
  // Fetch projects using the existing hook
  const { data: projects, isLoading } = useProjects();

  // Get array of months for the year
  const getMonthsOfYear = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(startOfMonth(new Date(year, i, 1)));
    }
    return months;
  };

  // Handle year change
  const handleYearChange = (yearDelta: number) => {
    setYear(prevYear => prevYear + yearDelta);
  };

  const months = getMonthsOfYear();

  // Filter projects that have start and end dates in the current year
  const filteredProjects = projects?.filter(project => {
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.end_date);
    return startDate.getFullYear() <= year && endDate.getFullYear() >= year;
  }) || [];

  // Group projects by category
  const groupedProjects = {
    all: filteredProjects,
    individual_events: filteredProjects.filter(p => p.event_path === 'individual_event'),
    projects: filteredProjects.filter(p => p.event_path === 'project' || p.event_path === 'series'),
    task_projects: filteredProjects.filter(p => p.event_path === 'task_project')
  };

  return (
    <div className="space-y-6">
      <YearNavigation year={year} onYearChange={handleYearChange} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="individual_events">الفعاليات المنفردة</TabsTrigger>
          <TabsTrigger value="projects">المشاريع</TabsTrigger>
          <TabsTrigger value="task_projects">مشاريع المهام</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <Card className="p-4 overflow-auto">
            <div className="min-w-[1200px]">
              <MonthsHeader months={months} />
              
              {isLoading ? (
                <div className="mt-4 space-y-6">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : groupedProjects.all.length === 0 ? (
                <div className="mt-4 p-8 text-center text-gray-500">
                  لا توجد مشاريع في هذه السنة
                </div>
              ) : (
                <div className="mt-4 space-y-6">
                  {groupedProjects.all.map((project) => (
                    <ProjectTasksRow
                      key={project.id}
                      project={project}
                      months={months}
                      today={today}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="individual_events" className="mt-0">
          <Card className="p-4 overflow-auto">
            <div className="min-w-[1200px]">
              <MonthsHeader months={months} />
              
              {isLoading ? (
                <div className="mt-4 space-y-6">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : groupedProjects.individual_events.length === 0 ? (
                <div className="mt-4 p-8 text-center text-gray-500">
                  لا توجد فعاليات منفردة في هذه السنة
                </div>
              ) : (
                <div className="mt-4 space-y-6">
                  {groupedProjects.individual_events.map((project) => (
                    <ProjectTasksRow
                      key={project.id}
                      project={project}
                      months={months}
                      today={today}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="projects" className="mt-0">
          <Card className="p-4 overflow-auto">
            <div className="min-w-[1200px]">
              <MonthsHeader months={months} />
              
              {isLoading ? (
                <div className="mt-4 space-y-6">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : groupedProjects.projects.length === 0 ? (
                <div className="mt-4 p-8 text-center text-gray-500">
                  لا توجد مشاريع في هذه السنة
                </div>
              ) : (
                <div className="mt-4 space-y-6">
                  {groupedProjects.projects.map((project) => (
                    <ProjectTasksRow
                      key={project.id}
                      project={project}
                      months={months}
                      today={today}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="task_projects" className="mt-0">
          <Card className="p-4 overflow-auto">
            <div className="min-w-[1200px]">
              <MonthsHeader months={months} />
              
              {isLoading ? (
                <div className="mt-4 space-y-6">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : groupedProjects.task_projects.length === 0 ? (
                <div className="mt-4 p-8 text-center text-gray-500">
                  لا توجد مشاريع مهام في هذه السنة
                </div>
              ) : (
                <div className="mt-4 space-y-6">
                  {groupedProjects.task_projects.map((project) => (
                    <ProjectTasksRow
                      key={project.id}
                      project={project}
                      months={months}
                      today={today}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <StatusLegend />
    </div>
  );
};
