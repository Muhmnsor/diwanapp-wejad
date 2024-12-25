import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { BannerControls } from "./BannerControls";
import { BannerDisplay } from "./BannerDisplay";
import { supabase } from "@/integrations/supabase/client";

export const Banner = () => {
  const [desktopImage, setDesktopImage] = useState("");
  const [mobileImage, setMobileImage] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchActiveBanner = async () => {
      try {
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .eq('active', true)
          .maybeSingle();

        if (error) {
          console.error("خطأ في جلب البانر:", error);
          return;
        }

        if (data) {
          console.log("تم جلب البانر بنجاح:", data);
          setDesktopImage(data.desktop_image);
          setMobileImage(data.mobile_image);
        } else {
          console.log("لا يوجد بانر نشط حالياً");
        }
      } catch (error) {
        console.error("خطأ غير متوقع:", error);
      }
    };

    fetchActiveBanner();
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
      const { error } = await supabase
        .from('banners')
        .upsert({
          desktop_image: desktopImage,
          mobile_image: mobileImage,
          active: true,
        });

      if (error) throw error;

      toast.success("تم حفظ البانر بنجاح");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error("حدث خطأ أثناء حفظ البانر");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showControls = user?.isAdmin;

  return (
    <div className="w-full">
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
      
      <BannerDisplay
        desktopImage={desktopImage}
        mobileImage={mobileImage}
        isMobile={isMobile}
      />
    </div>
  );
};