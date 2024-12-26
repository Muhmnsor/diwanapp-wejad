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
    <div className="relative bg-gray-100 rounded-lg overflow-hidden w-full shadow-md">
      <Carousel className="w-full">
        <CarouselContent>
          <CarouselItem>
            <img
              src={displayImage}
              alt="Banner"
              className={`w-full object-cover ${
                isMobile 
                  ? "h-[225px] md:h-[300px]"
                  : "h-[225px] md:h-[300px]"
              }`}
            />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
};