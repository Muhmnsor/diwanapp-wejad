import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center w-full" dir="rtl">
      <img 
        src="/lovable-uploads/6e693a05-5355-4718-95b9-23327287d678.png" 
        alt="ديوان" 
        className="h-16 sm:h-20 md:h-24 lg:h-28 object-contain cursor-pointer w-auto max-w-[200px] sm:max-w-[250px] md:max-w-[300px]"
        onClick={() => navigate("/")}
      />
    </div>
  );
};
