interface PreviewDisplayProps {
  previewUrl: string | null;
}

export const PreviewDisplay = ({ previewUrl }: PreviewDisplayProps) => {
  if (!previewUrl) return null;

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border">
      <iframe 
        src={previewUrl} 
        className="h-full w-full"
        title="معاينة القالب"
      />
    </div>
  );
};