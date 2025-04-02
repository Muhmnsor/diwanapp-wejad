
import React, { useState } from "react";
import { HRTabs } from "@/components/hr/HRTabs";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useLocation } from "react-router-dom";
import { InlineCalendarDemo } from "@/components/demo/InlineCalendarDemo";

const HR = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get("tab") || "employees";

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <HRTabs defaultTab={defaultTab} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HR;
