import { Card } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PortfolioCardProps {
  portfolio: {
    id: string;
    name: string;
    description: string | null;
    project_count?: number;
  };
  onEdit: (portfolio: any) => void;
  onDelete: (portfolio: any) => void;
}

export const PortfolioCard = ({ portfolio, onEdit, onDelete }: PortfolioCardProps) => {
  console.log('📂 Rendering portfolio card:', portfolio);
  
  return (
    <Card className="p-4 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Link 
            to={`/portfolios/${portfolio.id}`}
            className="text-lg font-semibold hover:text-primary transition-colors"
          >
            {portfolio.name}
          </Link>
          <p className="text-sm text-gray-500 mt-1">
            عدد المشاريع: {portfolio.project_count || 0}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(portfolio)}
            className="h-8 w-8"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(portfolio)}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {portfolio.description && (
        <p className="text-sm text-gray-600">{portfolio.description}</p>
      )}
    </Card>
  );
};