import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <img 
      src="/lovable-uploads/5779ac2f-5bd9-4178-8726-fa477d637cbf.png" 
      alt="Logo" 
      className={cn("w-8 h-8", className)}
    />
  );
};