
import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { InternalMailApp } from "@/components/mail/InternalMailApp";

const InternalMail = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow" dir="rtl">
        <h1 className="text-2xl font-bold mb-6">البريد الداخلي</h1>
        <div className="bg-white rounded-lg overflow-hidden shadow-sm border h-[calc(100vh-250px)]">
          <InternalMailApp />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default InternalMail;
