
import React from 'react';
import { HRTabs } from '@/components/hr/HRTabs';

export default function HR() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">نظام الموارد البشرية</h1>
      </div>
      
      <HRTabs defaultTab="dashboard" />
    </div>
  );
}
