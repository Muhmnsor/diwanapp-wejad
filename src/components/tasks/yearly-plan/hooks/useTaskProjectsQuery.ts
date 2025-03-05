
import { useQuery } from '@tanstack/react-query';
import { fetchTaskProjects } from '../services/yearlyPlanDataService';

export const useTaskProjectsQuery = () => {
  return useQuery({
    queryKey: ['task-projects-yearly-plan'],
    queryFn: fetchTaskProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
