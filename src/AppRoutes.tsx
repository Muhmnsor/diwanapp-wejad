import { Routes, Route } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { About } from '@/pages/About';
import { Portfolio } from '@/pages/Portfolio';
import { PortfolioDetails } from '@/pages/PortfolioDetails';
import { PortfolioProjectDetails } from '@/pages/PortfolioProjectDetails';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/portfolio/:id" element={<PortfolioDetails />} />
      <Route path="/portfolio-projects/:id" element={<PortfolioProjectDetails />} />
    </Routes>
  );
};

export default AppRoutes;
