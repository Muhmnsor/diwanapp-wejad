interface EventImageProps {
  imageUrl: string;
  title: string;
}

export const EventImage = ({ imageUrl, title }: EventImageProps) => {
  if (!imageUrl) return null;
  
  return (
    <div className="relative w-full h-[400px] overflow-hidden">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>
  );
};