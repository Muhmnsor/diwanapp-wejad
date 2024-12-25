import { Logo } from "@/components/Logo";

export const TopHeader = () => {
  return (
    <div className="w-full bg-white py-4 border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <img 
            src="/lovable-uploads/cc0ac885-dec0-4720-b30c-27371944cda6.png" 
            alt="ديوان" 
            className="h-24 object-contain"
          />
        </div>
      </div>
    </div>
  );
};