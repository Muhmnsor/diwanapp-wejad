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
        className="h-8 sm:h-10 md:h-12 lg:h-16 object-contain cursor-pointer w-auto max-w-[100px] sm:max-w-[150px] md:max-w-[200px]"
        onClick={() => navigate("/")}
      />
    </div>
  );
};
