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
    
    // Create a container with fixed dimensions
    const container = document.createElement('div');
    container.style.width = '400px'; // Fixed width
    container.style.backgroundColor = '#ffffff';
    container.style.padding = '24px';
    container.style.borderRadius = '12px';
    container.style.direction = 'rtl';
    
    // Clone the element
    const clone = element.cloneNode(true) as HTMLElement;
    container.appendChild(clone);
    document.body.appendChild(container);

    // Ensure QR code and images are loaded
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Convert to canvas with specific settings for SVG/QR support
    console.log("Converting to canvas");
    const canvas = await htmlToImage.toCanvas(container, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      width: container.offsetWidth,
      height: container.offsetHeight,
      style: {
        quality: 1,
        direction: 'rtl',
        transform: 'none',
        transformOrigin: 'center'
      },
      filter: (node) => {
        // Keep QR code and logo visible
        if (node instanceof HTMLElement) {
          const isQRCode = node.className.includes('qr-code');
          const isLogo = node.tagName === 'IMG' && node.className.includes('logo');
          return true;
        }
        return true;
      },
      // SVG/QR specific options
      includeQueryParams: true,
      skipAutoScale: true,
      cacheBust: true,
      imagePlaceholder: undefined,
      preferredFontFormat: "woff2"
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
    document.body.removeChild(container);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error during card export:", error);
    return false;
  }
};
