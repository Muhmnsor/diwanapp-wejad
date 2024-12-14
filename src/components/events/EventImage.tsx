interface EventImageProps {
  imageUrl: string;
  title: string;
}

export const EventImage = ({ imageUrl, title }: EventImageProps) => {
  if (!imageUrl) return null;
  
  return (
    <img
      src={imageUrl}
      alt={title}
      className="w-full h-[400px] object-cover rounded-lg mb-8"
    />
  );
};