
import React from 'react';
import { CustomFormsList } from '@/components/forms/CustomFormsList';
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";

const CustomFormsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <CustomFormsList />
      </div>
      
      <Footer />
    </div>
  );
};

export default CustomFormsPage;
