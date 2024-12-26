import { Banner } from "./Banner";

export const Hero = () => {
  return (
    <div className="w-full py-4"> {/* Reduced padding from py-6 to py-4 */}
      <div className="container mx-auto px-4 max-w-[1400px]">
        <Banner />
      </div>
    </div>
  );
};