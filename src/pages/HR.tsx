
import React from 'react';
import { HRTabs } from "@/components/hr/HRTabs";
import { HelmetProvider, Helmet } from 'react-helmet-async';

const HR = () => {
  return (
    <HelmetProvider>
      <div className="container mx-auto py-6">
        <Helmet>
          <title>إدارة الموارد البشرية</title>
          <meta name="description" content="نظام إدارة الموارد البشرية" />
        </Helmet>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold">إدارة الموارد البشرية</h1>
          <p className="text-muted-foreground">إدارة الموظفين والحضور والإجازات وتقارير الموارد البشرية</p>
        </div>
        
        <div className="space-y-8">
          <HRTabs defaultTab="dashboard" />
        </div>
      </div>
    </HelmetProvider>
  );
};

export default HR;
