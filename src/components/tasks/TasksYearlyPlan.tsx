
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { YearNavigation } from './yearly-plan/components/YearNavigation';
import { MonthsHeader } from './yearly-plan/components/MonthsHeader';
import { WorkspaceRow } from './yearly-plan/components/WorkspaceRow';
import { StatusLegend } from './yearly-plan/components/StatusLegend';
import { YearlyPlanStats } from './yearly-plan/components/YearlyPlanStats';
import { YearlyPlanFilter } from './yearly-plan/components/YearlyPlanFilter';
import { useYearlyPlanData } from './yearly-plan/hooks/useYearlyPlanData';
import { Skeleton } from '@/components/ui/skeleton';

export const TasksYearlyPlan = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const today = new Date();

  // استخدام Hook لجلب البيانات
  const { 
    workspaces, 
    months, 
    isLoading, 
    filters, 
    setFilters,
    toggleWorkspaceExpanded,
    toggleProjectExpanded
  } = useYearlyPlanData(year);

  // التعامل مع تغيير السنة
  const handleYearChange = (yearDelta: number) => {
    setYear(prevYear => prevYear + yearDelta);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <YearNavigation year={year} onYearChange={handleYearChange} />
      
      {isLoading ? (
        <>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </>
      ) : (
        <>
          <YearlyPlanStats workspaces={workspaces} />
          
          <YearlyPlanFilter 
            workspaces={workspaces} 
            filters={filters} 
            onFilterChange={setFilters} 
          />
          
          <Card className="p-4 overflow-auto">
            <div className="min-w-[1200px]">
              <MonthsHeader months={months} />
              
              <div className="mt-4 space-y-6">
                {workspaces.map((workspace) => (
                  <WorkspaceRow
                    key={workspace.id}
                    workspace={workspace}
                    months={months}
                    today={today}
                    onToggleExpand={toggleWorkspaceExpanded}
                    onToggleProject={toggleProjectExpanded}
                  />
                ))}
              </div>
            </div>
          </Card>

          <StatusLegend />
        </>
      )}
    </div>
  );
};
