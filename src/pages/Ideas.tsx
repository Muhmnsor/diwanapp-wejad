import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { UnderDevelopment } from "@/components/shared/UnderDevelopment";

const Ideas = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      <UnderDevelopment />
      <Footer />
    </div>
  );
};

export default Ideas;