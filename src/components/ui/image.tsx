import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface ImageProps extends HTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}

const Image = ({ src, alt, className, ...props }: ImageProps) => {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("w-full h-full object-cover", className)}
      {...props}
    />
  );
};

export default Image;