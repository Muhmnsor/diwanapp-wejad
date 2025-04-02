
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { HRTabs } from "@/components/hr/HRTabs";
import { HRDashboard } from "@/components/hr/dashboard/HRDashboard";
import { Helmet, HelmetProvider } from "react-helmet-async";

export default function HR() {
  return (
    <HelmetProvider>
      <div className="container mx-auto py-4">
        <Helmet>
          <title>إدارة الموارد البشرية</title>
        </Helmet>
        <h1 className="text-3xl font-bold mb-6">إدارة الموارد البشرية</h1>
        
        <Card>
          <CardContent className="pt-6">
            <HRDashboard />
            <HRTabs />
          </CardContent>
        </Card>
      </div>
    </HelmetProvider>
  );
}
