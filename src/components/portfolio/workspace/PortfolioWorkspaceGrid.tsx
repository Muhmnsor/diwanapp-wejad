import { PortfolioWorkspaceCard } from "./PortfolioWorkspaceCard";

interface PortfolioWorkspaceGridProps {
  items: any[];
  getProgress: (workspaceId: string) => number;
  onWorkspaceClick: (workspaceId: string) => void;
}

export const PortfolioWorkspaceGrid = ({
  items,
  getProgress,
  onWorkspaceClick
}: PortfolioWorkspaceGridProps) => {
  if (!items?.length) {
    return <p className="text-gray-500">لا توجد مشاريع في هذه المحفظة</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <PortfolioWorkspaceCard
          key={item.gid}
          item={item}
          progress={getProgress(item.gid)}
          onClick={onWorkspaceClick}
        />
      ))}
    </div>
  );
};