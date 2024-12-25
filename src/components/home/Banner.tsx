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
    <div className="w-full mx-auto">
      {showControls && (
        <div className="max-w-7xl mx-auto px-4 mb-6">
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
        </div>
      )}
      
      {(desktopImage || mobileImage) && (
        <div className="relative w-full bg-gray-100">
          <Carousel className="w-full">
            <CarouselContent>
              <CarouselItem>
                <img
                  src={isMobile ? (mobileImage || desktopImage) : (desktopImage || mobileImage)}
                  alt="Banner"
                  className="w-full h-[300px] md:h-[400px] lg:h-[500px] object-cover"
                />
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      )}
    </div>
  );
};