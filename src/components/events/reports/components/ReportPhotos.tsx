import { useState } from "react";

interface ReportPhotosProps {
  photos: { url: string; description: string; }[];
}

export const ReportPhotos = ({ photos }: ReportPhotosProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!photos.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">الصور المرفقة</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative group">
            <img
              src={photo.url}
              alt={photo.description || `صورة ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg cursor-pointer"
              onClick={() => setSelectedPhoto(photo.url)}
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-sm rounded-b-lg">
              {photo.description || `صورة ${index + 1}`}
            </div>
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={selectedPhoto}
            alt="صورة مكبرة"
            className="max-w-[90%] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </div>
  );
};