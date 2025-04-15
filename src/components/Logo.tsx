import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <img 
      src="/lovable-uploads/8f06dc5f-92e3-4f27-8dbb-9769d6e9d178.png" 
      alt="Logo" 
      className={cn("w-16 h-16 logo object-contain mb-4", className)}
    />
  );
};