
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { HRSecondaryHeader } from "@/components/hr/HRSecondaryHeader";
import { useEffect } from "react";

const HRDashboard = () => {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  
  // Redirect to overview page if at root HR path
  useEffect(() => {
    if (currentPath === "/admin/hr") {
      navigate("/admin/hr/overview", { replace: true });
    }
  }, [currentPath, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      <HRSecondaryHeader />
      
      <div className="container mx-auto px-4 py-6 flex-grow" dir="rtl">
        <Outlet />
      </div>
      
      <Footer />
    </div>
  );
};

export default HRDashboard;
