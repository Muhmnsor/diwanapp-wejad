
import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Task, Workspace } from '@/types/workspace';
import { startOfMonth, endOfMonth, getMonth, format, addMonths, subMonths, isToday } from 'date-fns';
import { ar } from 'date-fns/locale';
import { YearNavigation } from './yearly-plan/components/YearNavigation';
import { StatusLegend } from './yearly-plan/components/StatusLegend';
import { GanttChart } from './yearly-plan/components/GanttChart';
import { TaskFilters } from './yearly-plan/components/TaskFilters';
import { ZoomControls } from './yearly-plan/components/ZoomControls';
import { fetchTaskProjects } from './yearly-plan/services/yearlyPlanDataService';
import { FilterIcon, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTaskProjectsQuery } from './yearly-plan/hooks/useTaskProjectsQuery';

export const TasksYearlyPlan = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [zoomLevel, setZoomLevel] = useState(100); // 100% is default
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: [] as string[],
    assignee: [] as string[],
    workspace: [] as string[],
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(true); // Set to true by default
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  // Fetch task projects data using React Query
  const { data: taskProjects, isLoading, error } = useTaskProjectsQuery();

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

  // Handle zoom change
  const handleZoomChange = (newZoom: number) => {
    setZoomLevel(newZoom);
  };

  // Scroll to current month on initial load
  useEffect(() => {
    if (scrollRef.current) {
      const currentMonthIndex = getMonth(new Date());
      const monthWidth = scrollRef.current.scrollWidth / 12;
      scrollRef.current.scrollLeft = monthWidth * currentMonthIndex - monthWidth;
    }
  }, []);

  // Filter and group tasks based on filters and groupBy settings
  const getFilteredAndGroupedData = () => {
    if (!taskProjects) return [];

    // Always return all projects by default
    return taskProjects;
  };

  const months = getMonthsOfYear();
  const filteredData = getFilteredAndGroupedData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <YearNavigation year={year} onYearChange={handleYearChange} />
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search and filters */}
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="البحث عن مشاريع..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={showAllProjects}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={isFiltersOpen ? "bg-gray-100" : ""}
            >
              <FilterIcon size={18} />
            </Button>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <ZoomControls value={zoomLevel} onChange={handleZoomChange} />
          </div>
        </div>
        
        {isFiltersOpen && (
          <TaskFilters 
            filters={filters} 
            setFilters={setFilters}
            projects={taskProjects || []}
            showAllProjects={showAllProjects}
            setShowAllProjects={setShowAllProjects}
          />
        )}
      </div>
      
      <div ref={scrollRef} className="overflow-x-auto">
        <Card className="p-4">
          <div style={{ minWidth: `${zoomLevel}%` }}>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center p-8 text-red-500">
                حدث خطأ في تحميل البيانات، يرجى المحاولة مرة أخرى.
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                لا توجد مشاريع مهام لعرضها في الخطة السنوية.
              </div>
            ) : (
              <GanttChart 
                tasks={filteredData} 
                months={months} 
                today={today}
                zoomLevel={zoomLevel}
              />
            )}
          </div>
        </Card>
      </div>

      <StatusLegend />
    </div>
  );
};
