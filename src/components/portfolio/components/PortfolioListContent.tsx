import { PortfolioCard } from "./PortfolioCard";

interface PortfolioListContentProps {
  portfolios: any[];
  onEdit: (portfolio: any) => void;
  onDelete: (portfolio: any) => void;
}

export const PortfolioListContent = ({ 
  portfolios,
  onEdit,
  onDelete 
}: PortfolioListContentProps) => {
  if (!portfolios || portfolios.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        لا توجد محافظ حالياً
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {portfolios.map((portfolio) => (
        <PortfolioCard
          key={portfolio.id}
          portfolio={portfolio}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};