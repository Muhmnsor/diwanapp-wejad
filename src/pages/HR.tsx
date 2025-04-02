
import React from "react";
import { HRTabs } from "@/components/hr/HRTabs";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useLocation } from "react-router-dom";

const HR = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get("tab") || "employees";

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="w-full">
            <HRTabs defaultTab={defaultTab} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HR;
