
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { DocumentationContainer } from "@/components/documentation/DocumentationContainer";
import { useEffect } from "react";

const Documentation = () => {
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8">توثيق النظام</h1>
        <DocumentationContainer />
      </div>
      <Footer />
    </div>
  );
};

export default Documentation;
