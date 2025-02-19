
import { useNavigate } from "react-router-dom";

export const Logo = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center w-full">
      <img 
        src="/lovable-uploads/6e693a05-5355-4718-95b9-23327287d678.png" 
        alt="ديوان" 
        className="h-12 md:h-16 object-contain cursor-pointer"
        onClick={() => navigate("/")}
      />
    </div>
  );
};
