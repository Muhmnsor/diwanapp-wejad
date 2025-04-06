
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import DigitalAccountsManager from "@/components/digital-accounts/DigitalAccountsManager";

const DigitalAccounts = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8">الحسابات الرقمية</h1>
        <DigitalAccountsManager />
      </div>
      <Footer />
    </div>
  );
};

export default DigitalAccounts;
