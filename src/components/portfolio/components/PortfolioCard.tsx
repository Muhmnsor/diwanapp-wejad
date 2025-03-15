
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2 } from "lucide-react";
import type { Database } from '@/integrations/supabase/types';

type Portfolio = Database['public']['Tables']['portfolios']['Row'] & {
  total_projects: number;
};

interface PortfolioCardProps {
  portfolio: Portfolio;
  onEdit: (portfolio: { id: string; name: string; description: string | null }) => void;
  onDelete: (portfolio: { id: string; name: string }) => void;
  onClick: (e: React.MouseEvent, id: string) => void;
}

export const PortfolioCard = ({ portfolio, onEdit, onDelete, onClick }: PortfolioCardProps) => {
  return (
    <Card 
      key={portfolio.id} 
      className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={(e) => onClick(e, portfolio.id)}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg mb-1">{portfolio.name}</h3>
            <p className="text-sm text-gray-500">
              {portfolio.description || 'لا يوجد وصف'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit({
                  id: portfolio.id,
                  name: portfolio.name,
                  description: portfolio.description
                });
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete({
                  id: portfolio.id,
                  name: portfolio.name
                });
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>المشاريع</span>
            <span>{portfolio.total_projects}</span>
          </div>
          <Progress 
            value={50} 
            className="h-2"
          />
          <div className="text-xs text-gray-500 text-right">
            محفظة المشاريع
          </div>
        </div>
      </div>
    </Card>
  );
};
