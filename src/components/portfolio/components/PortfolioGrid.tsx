import { Card } from '@/components/ui/card';
import { Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type Portfolio = Database['public']['Tables']['portfolios']['Row'];

interface PortfolioGridProps {
  portfolios: Portfolio[];
}

export const PortfolioGrid = ({ portfolios }: PortfolioGridProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {portfolios?.map((portfolio) => (
        <Card 
          key={portfolio.id} 
          className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate(`/portfolios/${portfolio.id}`)}
        >
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-primary" />
              <span className="font-medium">{portfolio.name}</span>
            </div>
            
            <div className="text-sm text-gray-500 min-h-[2.5rem]">
              {portfolio.description || 'لا يوجد وصف'}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};