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
        className="h-24 sm:h-28 md:h-32 lg:h-36 object-contain cursor-pointer w-auto max-w-[250px] sm:max-w-[300px] md:max-w-[350px]"
        onClick={() => navigate("/")}
      />
    </div>
  );
};
