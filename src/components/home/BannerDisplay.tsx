import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface BannerDisplayProps {
  desktopImage: string;
  mobileImage: string;
  isMobile: boolean;
}

export const BannerDisplay = ({ desktopImage, mobileImage, isMobile }: BannerDisplayProps) => {
  // استخدام صورة افتراضية في حالة عدم وجود صور
  const defaultImage = "/placeholder.svg";
  const displayImage = isMobile 
    ? (mobileImage || desktopImage || defaultImage)
    : (desktopImage || mobileImage || defaultImage);

  return (
    <div className="relative bg-gray-100 rounded-lg overflow-hidden">
      <Carousel className="w-full">
        <CarouselContent>
          <CarouselItem>
            <img
              src={displayImage}
              alt="Banner"
              className={`w-full object-cover ${
                isMobile 
                  ? "h-[300px]" // الارتفاع للجوال يبقى كما هو
                  : "h-[300px]" // تم تقليل ارتفاع نسخة سطح المكتب من 400px إلى 300px
              }`}
            />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
};