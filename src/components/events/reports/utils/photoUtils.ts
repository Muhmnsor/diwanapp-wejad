export const parsePhotos = (photos: any[]): { url: string; description: string; }[] => {
  return photos.map(photo => {
    if (typeof photo === 'string') {
      try {
        return JSON.parse(photo);
      } catch {
        return { url: photo, description: '' };
      }
    }
    return photo;
  });
};

export const downloadPhotos = async (
  photos: { url: string; description: string; }[],
  imagesFolder: any
): Promise<void> => {
  const downloadPromises = photos.map(async (photo, index) => {
    if (!photo.url) {
      console.log(`Skipping empty photo at index ${index}`);
      return;
    }

    try {
      console.log(`Downloading image ${index + 1}:`, photo.url);
      const response = await fetch(photo.url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const blob = await response.blob();
      const extension = photo.url.split('.').pop() || 'jpg';
      const fileName = `صورة-${index + 1}-${photo.description || ''}.${extension}`;
      
      console.log(`Adding image to zip:`, fileName);
      imagesFolder.file(fileName, blob);
    } catch (error) {
      console.error(`Error downloading image ${index}:`, error);
    }
  });

  await Promise.all(downloadPromises);
};