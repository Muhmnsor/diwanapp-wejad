
import { useParams } from "react-router-dom";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";

const UserProfile = () => {
  const { userId } = useParams();

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-2xl font-bold mb-4">الملف الشخصي للمستخدم</h1>
        <p>معرف المستخدم: {userId}</p>
        <div className="mt-6 p-4 border rounded-lg">
          <p className="text-muted-foreground">جاري تحميل بيانات المستخدم...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserProfile;
