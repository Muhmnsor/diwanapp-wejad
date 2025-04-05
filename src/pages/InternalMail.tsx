
import React, { useState } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { InternalMailApp } from "@/components/mail/InternalMailApp";

const InternalMail = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow" dir="rtl">
        <InternalMailApp />
      </div>
      
      <Footer />
    </div>
  );
};

export default InternalMail;
