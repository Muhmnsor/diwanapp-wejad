interface ReportPhotosProps {
  photos: Array<{ url: string; description: string }>;
}

export const ReportPhotos = ({ photos }: ReportPhotosProps) => {
  if (!photos?.length) return null;

  return (
    <div>
      <h4 className="font-medium mb-2">الصور المرفقة</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="space-y-2">
            <img
              src={photo.url}
              alt={photo.description}
              className="w-full h-48 object-cover rounded-lg"
            />
            <p className="text-sm text-gray-600">{photo.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};