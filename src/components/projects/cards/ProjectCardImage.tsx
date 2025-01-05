import { cn } from "@/lib/utils";

interface ProjectCardImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ProjectCardImage = ({ src, alt, className }: ProjectCardImageProps) => {
  return (
    <div className="relative w-full h-40">
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-40 object-cover rounded-t-lg",
          className
        )}
      />
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
};