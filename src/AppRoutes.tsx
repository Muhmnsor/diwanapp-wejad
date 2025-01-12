import { Routes, Route } from 'react-router-dom';
import PortfolioDetails from '@/pages/PortfolioDetails';
import PortfolioProjectDetails from '@/pages/PortfolioProjectDetails';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/portfolio/:id" element={<PortfolioDetails />} />
      <Route path="/portfolio-projects/:id" element={<PortfolioProjectDetails />} />
    </Routes>
  );
};

export default AppRoutes;