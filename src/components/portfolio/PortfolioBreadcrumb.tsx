import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface PortfolioBreadcrumbProps {
  portfolioName: string;
  portfolioId: string;
  projectName?: string;
}

export const PortfolioBreadcrumb = ({ 
  portfolioName, 
  portfolioId,
  projectName 
}: PortfolioBreadcrumbProps) => {
  return (
    <nav className="flex items-center gap-2 mb-6 text-sm text-gray-600" dir="rtl">
      <Link 
        to="/tasks" 
        className="hover:text-primary transition-colors"
      >
        المحافظ
      </Link>
      <ChevronLeft className="h-4 w-4" />
      {projectName ? (
        <>
          <Link 
            to={`/portfolios/${portfolioId}`}
            className="hover:text-primary transition-colors"
          >
            {portfolioName}
          </Link>
          <ChevronLeft className="h-4 w-4" />
          <span className="text-gray-900">{projectName}</span>
        </>
      ) : (
        <span className="text-gray-900">{portfolioName}</span>
      )}
    </nav>
  );
};