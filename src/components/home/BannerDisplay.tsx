import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface BannerDisplayProps {
  desktopImage: string;
  mobileImage: string;
  isMobile: boolean;
}

export const BannerDisplay = ({ desktopImage, mobileImage, isMobile }: BannerDisplayProps) => {
  const defaultImage = "/placeholder.svg";
  const displayImage = isMobile 
    ? (mobileImage || desktopImage || defaultImage)
    : (desktopImage || mobileImage || defaultImage);

  return (
    <div className="relative bg-gray-100 rounded-lg overflow-hidden w-full max-w-[1400px] mx-auto shadow-md"> {/* Added max-w and centered */}
      <Carousel className="w-full">
        <CarouselContent>
          <CarouselItem>
            <img
              src={displayImage}
              alt="Banner"
              className={`w-full object-cover ${
                isMobile 
                  ? "h-[180px] md:h-[250px]" // Further reduced height
                  : "h-[180px] md:h-[250px]" // Further reduced height
              }`}
            />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
};