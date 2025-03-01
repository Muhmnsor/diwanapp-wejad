
import { useNavigate } from "react-router-dom";

export const Logo = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-start w-full" dir="rtl">
      <img 
        src="/lovable-uploads/6e693a05-5355-4718-95b9-23327287d678.png" 
        alt="ديوان" 
        className="h-8 sm:h-10 md:h-12 lg:h-16 object-contain cursor-pointer max-w-[120px] sm:max-w-full"
        onClick={() => navigate("/")}
      />
    </div>
  );
};
