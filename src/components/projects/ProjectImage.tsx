interface ProjectImageProps {
  imageUrl: string;
  title: string;
}

export const ProjectImage = ({ imageUrl, title }: ProjectImageProps) => {
  if (!imageUrl) return null;
  
  return (
    <div className="relative w-full h-[400px] overflow-hidden bg-gray-100">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50"
        aria-hidden="true"
      />
    </div>
  );
};