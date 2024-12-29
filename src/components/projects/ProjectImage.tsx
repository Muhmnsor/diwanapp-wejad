interface ProjectImageProps {
  imageUrl: string;
  title: string;
}

export const ProjectImage = ({ imageUrl, title }: ProjectImageProps) => {
  if (!imageUrl) return null;
  
  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover"
      />
    </div>
  );
};