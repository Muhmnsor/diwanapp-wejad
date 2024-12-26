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
  const [error, setError] = useState<string | null>(null);
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
        console.log('Fetching active banner...');
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Error fetching banner:", error);
          setError(error.message);
          toast.error("حدث خطأ في جلب البانر");
          return;
        }

        if (data) {
          console.log("Banner fetched successfully:", data);
          setDesktopImage(data.desktop_image);
          setMobileImage(data.mobile_image);
          setError(null);
        } else {
          console.log("No active banner found");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        toast.error("حدث خطأ غير متوقع");
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
      console.log('Saving banner...');
      // First, deactivate all existing banners
      const { error: deactivateError } = await supabase
        .from('banners')
        .update({ active: false })
        .eq('active', true);

      if (deactivateError) throw deactivateError;

      // Then, insert the new banner
      const { error: insertError } = await supabase
        .from('banners')
        .insert({
          desktop_image: desktopImage,
          mobile_image: mobileImage,
          active: true,
        });

      if (insertError) throw insertError;

      toast.success("تم حفظ البانر بنجاح");
      setIsEditing(false);
      setError(null);
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error("حدث خطأ أثناء حفظ البانر");
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showControls = user?.isAdmin;

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
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