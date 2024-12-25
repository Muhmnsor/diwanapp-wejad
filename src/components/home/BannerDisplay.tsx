import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface BannerDisplayProps {
  desktopImage: string;
  mobileImage: string;
  isMobile: boolean;
}

export const BannerDisplay = ({ desktopImage, mobileImage, isMobile }: BannerDisplayProps) => {
  return (
    <div className="relative bg-gray-100 rounded-lg overflow-hidden">
      <Carousel className="w-full">
        <CarouselContent>
          <CarouselItem>
            <img
              src={isMobile ? (mobileImage || desktopImage) : (desktopImage || mobileImage)}
              alt="Banner"
              className="w-full h-[300px] md:h-[400px] object-cover"
            />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
};