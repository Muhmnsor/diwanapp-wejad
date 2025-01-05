import { EyeOff } from "lucide-react";

interface EventCardImageProps {
  imageUrl: string;
  title: string;
  isVisible?: boolean;
}

export const EventCardImage = ({ imageUrl, title, isVisible = true }: EventCardImageProps) => {
  return (
    <div className="relative">
      <img src={imageUrl} alt={title} className="w-full h-40 object-cover" />
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
        aria-hidden="true"
      />
      {!isVisible && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1">
          <EyeOff className="w-4 h-4" />
          مخفي
        </div>
      )}
    </div>
  );
};