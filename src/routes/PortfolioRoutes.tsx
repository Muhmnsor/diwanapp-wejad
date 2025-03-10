
import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import PortfolioDetails from "@/pages/PortfolioDetails";
import NewPortfolioProject from "@/pages/NewPortfolioProject";
import PortfolioProjectDetails from "@/pages/PortfolioProjectDetails";
import PortfolioWorkspaceDetails from "@/pages/PortfolioWorkspaceDetails";

export const PortfolioRoutes = [
  <Route 
    key="portfolio-details"
    path="/portfolios/:id" 
    element={
      <ProtectedRoute>
        <PortfolioDetails />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="new-portfolio-project"
    path="/portfolios/:portfolioId/projects/new" 
    element={
      <ProtectedRoute>
        <NewPortfolioProject />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="portfolio-project-details"
    path="/portfolio-projects/:projectId" 
    element={
      <ProtectedRoute>
        <PortfolioProjectDetails />
      </ProtectedRoute>
    } 
  />,
  <Route 
    key="portfolio-workspace-details"
    path="/portfolio-workspaces/:workspaceId" 
    element={
      <ProtectedRoute>
        <PortfolioWorkspaceDetails />
      </ProtectedRoute>
    } 
  />
];

