import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePortfolioList = () => {
  return useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      console.log('🔄 Fetching portfolios...');
      
      const { data: portfolios, error } = await supabase
        .from('portfolios')
        .select(`
          *,
          project_count: portfolio_projects(count),
          only_project_count: portfolio_only_projects(count)
        `);

      if (error) {
        console.error('Error fetching portfolios:', error);
        throw error;
      }

      // Calculate total projects for each portfolio
      const portfoliosWithTotalCount = portfolios.map(portfolio => ({
        ...portfolio,
        project_count: (portfolio.project_count || 0) + (portfolio.only_project_count || 0)
      }));

      console.log('📊 Fetched portfolios:', portfoliosWithTotalCount);
      return portfoliosWithTotalCount;
    }
  });
};