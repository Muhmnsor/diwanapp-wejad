
import { useEffect } from 'react';
import { YearlyPlanFilters } from '../types/yearlyPlanTypes';
import { getMonthsOfYear } from '../utils/demoDataGenerator';
import { applyFilters } from '../utils/dataFilters';
import { fetchYearlyPlanData } from '../services/yearlyPlanDataService';
import { useYearlyPlanState } from './useYearlyPlanState';

export const useYearlyPlanData = (year: number) => {
  const {
    workspaces,
    setWorkspaces,
    filters,
    setFilters,
    isLoading,
    setIsLoading,
    toggleWorkspaceExpanded,
    toggleProjectExpanded
  } = useYearlyPlanState();

  // Fetch demo data
  useEffect(() => {
    setIsLoading(true);
    
    const loadData = async () => {
      try {
        const data = await fetchYearlyPlanData(year);
        setWorkspaces(data);
      } catch (error) {
        console.error('Error loading yearly plan data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [year, setWorkspaces, setIsLoading]);

  // تطبيق الفلاتر على البيانات
  const filteredWorkspaces = applyFilters(workspaces, filters);

  return {
    workspaces: filteredWorkspaces,
    months: getMonthsOfYear(year),
    isLoading,
    filters,
    setFilters,
    toggleWorkspaceExpanded,
    toggleProjectExpanded
  };
};
