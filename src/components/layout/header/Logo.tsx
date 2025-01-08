import { useNavigate } from "react-router-dom";

export const Logo = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full flex justify-center md:justify-start md:w-auto">
      <img 
        src="/lovable-uploads/6e693a05-5355-4718-95b9-23327287d678.png" 
        alt="ديوان" 
        className="h-20 object-contain cursor-pointer"
        onClick={() => navigate("/")}
      />
    </div>
  );
};