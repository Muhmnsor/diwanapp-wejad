import { ImageUpload } from "@/components/ui/image-upload";
import { useEffect, useState } from "react";

export const Banner = () => {
  const [desktopImage, setDesktopImage] = useState("");
  const [mobileImage, setMobileImage] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">صورة سطح المكتب</label>
          <ImageUpload 
            value={desktopImage} 
            onChange={handleDesktopImageUpload}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">صورة الجوال</label>
          <ImageUpload 
            value={mobileImage} 
            onChange={handleMobileImageUpload}
          />
        </div>
      </div>
      
      {(desktopImage || mobileImage) && (
        <div className="mt-8">
          <img
            src={isMobile ? (mobileImage || desktopImage) : (desktopImage || mobileImage)}
            alt="Banner"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};