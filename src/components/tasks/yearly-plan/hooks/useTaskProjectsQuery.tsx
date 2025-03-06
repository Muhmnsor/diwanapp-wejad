
import { useQuery } from '@tanstack/react-query';
import { fetchTaskProjects } from '../services/yearlyPlanDataService';

export const useTaskProjectsQuery = () => {
  return useQuery({
    queryKey: ['task-projects-yearly'],
    queryFn: fetchTaskProjects,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
