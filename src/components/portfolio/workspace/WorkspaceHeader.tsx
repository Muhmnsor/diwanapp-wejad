import { PortfolioBreadcrumb } from '../PortfolioBreadcrumb';

interface WorkspaceHeaderProps {
  portfolioName: string;
  portfolioId: string;
  workspaceName: string;
}

export const WorkspaceHeader = ({ 
  portfolioName, 
  portfolioId, 
  workspaceName 
}: WorkspaceHeaderProps) => {
  return (
    <div className="space-y-6">
      <PortfolioBreadcrumb 
        portfolioName={portfolioName}
        portfolioId={portfolioId}
        workspaceName={workspaceName}
      />
      <h1 className="text-2xl font-bold">{workspaceName}</h1>
    </div>
  );
};