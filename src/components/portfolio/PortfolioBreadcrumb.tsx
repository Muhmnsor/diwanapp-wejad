import { ChevronLeft, Folder } from "lucide-react";
import { Link } from "react-router-dom";

interface PortfolioBreadcrumbProps {
  portfolioName: string;
  portfolioId: string;
  projectName?: string;
  workspaceName?: string;
}

export const PortfolioBreadcrumb = ({ 
  portfolioName, 
  portfolioId,
  projectName,
  workspaceName
}: PortfolioBreadcrumbProps) => {
  return (
    <nav className="flex items-center gap-2 mb-6 text-sm text-gray-600" dir="rtl">
      <Link 
        to="/tasks" 
        className="hover:text-primary transition-colors flex items-center gap-1"
      >
        <Folder className="h-4 w-4" />
        المحافظ
      </Link>
      <ChevronLeft className="h-4 w-4" />
      {workspaceName ? (
        <>
          <Link 
            to={`/portfolios/${portfolioId}`}
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <Folder className="h-4 w-4" />
            {portfolioName}
          </Link>
          <ChevronLeft className="h-4 w-4" />
          <span className="text-gray-900">{workspaceName}</span>
        </>
      ) : projectName ? (
        <>
          <Link 
            to={`/portfolios/${portfolioId}`}
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <Folder className="h-4 w-4" />
            {portfolioName}
          </Link>
          <ChevronLeft className="h-4 w-4" />
          <span className="text-gray-900">{projectName}</span>
        </>
      ) : (
        <span className="text-gray-900 flex items-center gap-1">
          <Folder className="h-4 w-4" />
          {portfolioName}
        </span>
      )}
    </nav>
  );
};