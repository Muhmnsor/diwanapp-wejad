import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { BannerControls } from "./BannerControls";
import { BannerDisplay } from "./BannerDisplay";

export const Banner = () => {
  const [desktopImage, setDesktopImage] = useState("");
  const [mobileImage, setMobileImage] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDesktopImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setDesktopImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMobileImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setMobileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!desktopImage || !mobileImage) {
      toast.error("الرجاء إضافة الصور المطلوبة");
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would implement the save logic
      toast.success("تم حفظ البانر بنجاح");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error("حدث خطأ أثناء حفظ البانر");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only show upload controls for admin users
  const showControls = user?.isAdmin;

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Admin Controls */}
      {showControls && (
        <div className="mb-6">
          <BannerControls
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            desktopImage={desktopImage}
            mobileImage={mobileImage}
            onDesktopImageUpload={handleDesktopImageUpload}
            onMobileImageUpload={handleMobileImageUpload}
            onSave={handleSave}
            isSubmitting={isSubmitting}
          />
        </div>
      )}
      
      {/* Banner Display - Shown to Everyone */}
      <BannerDisplay
        desktopImage={desktopImage}
        mobileImage={mobileImage}
        isMobile={isMobile}
      />
    </div>
  );
};