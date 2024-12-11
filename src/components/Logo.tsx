import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <img 
      src="/lovable-uploads/4ab86edd-10cb-4a50-a6cf-2b343c2361db.png" 
      alt="Logo" 
      className={cn("w-16 h-16", className)}
    />
  );
};