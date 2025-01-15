import { useState } from "react";
import { DeletePortfolioDialog } from "./DeletePortfolioDialog";
import { EditPortfolioDialog } from "./EditPortfolioDialog";
import { usePortfolioList } from "./hooks/usePortfolioList";
import { PortfolioListContent } from "./components/PortfolioListContent";
import { PortfolioListLoading } from "./components/PortfolioListLoading";

export const PortfolioList = () => {
  const [portfolioToEdit, setPortfolioToEdit] = useState<any>(null);
  const [portfolioToDelete, setPortfolioToDelete] = useState<any>(null);
  
  const { data: portfolios, isLoading, refetch } = usePortfolioList();

  console.log('📂 PortfolioList - Current portfolios:', portfolios);

  const handleEditSuccess = async () => {
    setPortfolioToEdit(null);
    await refetch();
  };

  const handleDeleteSuccess = async () => {
    setPortfolioToDelete(null);
    await refetch();
  };

  if (isLoading) {
    return <PortfolioListLoading />;
  }

  return (
    <>
      <PortfolioListContent
        portfolios={portfolios}
        onEdit={setPortfolioToEdit}
        onDelete={setPortfolioToDelete}
      />

      <EditPortfolioDialog
        portfolio={portfolioToEdit}
        open={!!portfolioToEdit}
        onOpenChange={(open) => !open && setPortfolioToEdit(null)}
        onSuccess={handleEditSuccess}
      />

      <DeletePortfolioDialog
        portfolio={portfolioToDelete}
        open={!!portfolioToDelete}
        onOpenChange={(open) => !open && setPortfolioToDelete(null)}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
};