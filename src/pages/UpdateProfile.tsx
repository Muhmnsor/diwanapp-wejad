
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { DisplayNameForm } from "@/components/profile/DisplayNameForm";
import { User } from "lucide-react";

const UpdateProfile = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex items-center justify-center gap-3 mb-8">
          <User className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">تحديث الملف الشخصي</h1>
        </div>
        <DisplayNameForm />
      </div>
      <Footer />
    </div>
  );
};

export default UpdateProfile;
