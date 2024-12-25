import { ImageUpload } from "@/components/ui/image-upload";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const Banner = () => {
  const [desktopImage, setDesktopImage] = useState("");
  const [mobileImage, setMobileImage] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
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

  // Only show upload controls for admin users
  const showControls = user?.isAdmin;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 space-y-6">
      {showControls && (
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
      )}
      
      {(desktopImage || mobileImage) && (
        <Carousel className="w-full">
          <CarouselContent>
            <CarouselItem>
              <img
                src={isMobile ? (mobileImage || desktopImage) : (desktopImage || mobileImage)}
                alt="Banner"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )}
    </div>
  );
};