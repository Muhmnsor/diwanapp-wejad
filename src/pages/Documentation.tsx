
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { DocumentationContainer } from "@/components/documentation/DocumentationContainer";
import { useEffect } from "react";
import { SecondaryHeader } from "@/components/settings/developer/SecondaryHeader";
import { useNavigate } from "react-router-dom";

const Documentation = () => {
  const navigate = useNavigate();
  
  // Redirect to developer settings with the documentation tab
  useEffect(() => {
    navigate("/admin/developer-settings?tab=overview", { replace: true });
  }, [navigate]);

  // This is a fallback in case the redirect hasn't happened yet
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <SecondaryHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8">توثيق النظام</h1>
        <DocumentationContainer />
      </div>
      <Footer />
    </div>
  );
};

export default Documentation;
