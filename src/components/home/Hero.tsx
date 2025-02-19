
import { Banner } from "./Banner";

export const Hero = () => {
  return (
    <div className="w-full py-4 bg-gradient-to-b from-[#F5F5F7] via-[#F5F5F7]/80 to-transparent relative">
      <div className="container mx-auto">
        <div className="w-full h-[250px] relative overflow-hidden rounded-xl">
          <img 
            src="/lovable-uploads/6e693a05-5355-4718-95b9-23327287d678.png" 
            alt="ديوان" 
            className="w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50"
            aria-hidden="true"
          />
        </div>
        <div className="-mt-10 relative z-10">
          <Banner />
        </div>
      </div>
    </div>
  );
};
