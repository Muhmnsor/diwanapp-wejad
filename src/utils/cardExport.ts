import * as htmlToImage from "html-to-image";

export const exportCardAsImage = async (elementId: string, fileName: string): Promise<boolean> => {
  console.log("Starting card export process");
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error("Element not found:", elementId);
    return false;
  }

  try {
    console.log("Setting up export configuration");
    
    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.backgroundColor = '#ffffff';
    clone.style.padding = '20px';
    clone.style.borderRadius = '0';
    document.body.appendChild(clone);

    // Convert to canvas with high quality settings
    console.log("Converting to canvas");
    const canvas = await htmlToImage.toCanvas(clone, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      quality: 1,
      width: element.offsetWidth,
      height: element.offsetHeight
    });

    // Convert canvas to blob
    console.log("Converting canvas to blob");
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', 1.0);
    });

    // Create download URL
    console.log("Creating download URL");
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Trigger download
    console.log("Triggering download");
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    console.log("Cleaning up");
    document.body.removeChild(link);
    document.body.removeChild(clone);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error during card export:", error);
    return false;
  }
};