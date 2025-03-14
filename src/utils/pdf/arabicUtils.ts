
/**
 * Utilities for handling Arabic text in PDF documents
 */

// Base64 encoded font data will be loaded here
// We'll use a simpler approach that doesn't rely on external URLs
let amiriFontBase64: Record<string, string> = {
  normal: '',
  bold: '',
  italics: '', 
  bolditalics: ''
};

// Initialize font loading status
let fontsLoaded = false;
let loadingPromise: Promise<void> | null = null;

/**
 * Load the Amiri font files and convert them to base64
 */
export const loadFonts = async (): Promise<void> => {
  if (fontsLoaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise(async (resolve) => {
    try {
      console.log("Loading Amiri fonts for PDF...");
      
      // Load the font files
      const normalFontResponse = await fetch('/fonts/amiri-regular.ttf');
      if (!normalFontResponse.ok) throw new Error(`Failed to load regular font: ${normalFontResponse.statusText}`);
      
      const boldFontResponse = await fetch('/fonts/amiri-bold.ttf');
      if (!boldFontResponse.ok) throw new Error(`Failed to load bold font: ${boldFontResponse.statusText}`);
      
      const italicsFontResponse = await fetch('/fonts/amiri-slanted.ttf');
      if (!italicsFontResponse.ok) throw new Error(`Failed to load italic font: ${italicsFontResponse.statusText}`);
      
      const boldItalicsFontResponse = await fetch('/fonts/amiri-boldslanted.ttf');
      if (!boldItalicsFontResponse.ok) throw new Error(`Failed to load bold italic font: ${boldItalicsFontResponse.statusText}`);
      
      // Convert to array buffers
      const normalBuffer = await normalFontResponse.arrayBuffer();
      const boldBuffer = await boldFontResponse.arrayBuffer();
      const italicsBuffer = await italicsFontResponse.arrayBuffer();
      const boldItalicsBuffer = await boldItalicsFontResponse.arrayBuffer();
      
      // Convert to base64
      amiriFontBase64.normal = arrayBufferToBase64(normalBuffer);
      amiriFontBase64.bold = arrayBufferToBase64(boldBuffer);
      amiriFontBase64.italics = arrayBufferToBase64(italicsBuffer);
      amiriFontBase64.bolditalics = arrayBufferToBase64(boldItalicsBuffer);
      
      fontsLoaded = true;
      console.log("Amiri fonts loaded successfully");
    } catch (error) {
      console.error("Error loading Amiri fonts:", error);
      // Fallback to online fonts in case of error
      console.warn("Falling back to online font sources");
      amiriFontBase64 = {
        normal: 'https://cdn.jsdelivr.net/npm/amiri-font@0.7.0/amiri-regular.ttf',
        bold: 'https://cdn.jsdelivr.net/npm/amiri-font@0.7.0/amiri-bold.ttf',
        italics: 'https://cdn.jsdelivr.net/npm/amiri-font@0.7.0/amiri-slanted.ttf',
        bolditalics: 'https://cdn.jsdelivr.net/npm/amiri-font@0.7.0/amiri-boldslanted.ttf'
      };
    }
    resolve();
  });

  return loadingPromise;
};

/**
 * Helper function to convert ArrayBuffer to base64 string
 */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  try {
    const binary = Array.from(new Uint8Array(buffer))
      .map(b => String.fromCharCode(b))
      .join('');
    return btoa(binary);
  } catch (error) {
    console.error("Error converting array buffer to base64:", error);
    throw error;
  }
};

/**
 * Process Arabic text for proper display in PDFs
 * This function ensures Arabic text displays correctly in pdfmake
 */
export const processArabicText = (text: string): string => {
  if (!text) return "";
  
  // Return the text as is - pdfmake with Amiri font handles Arabic correctly
  // when direction and font are set properly
  return text;
};

/**
 * Get PDF definition for Arabic font support
 */
export const getArabicFontDefinition = async (): Promise<Record<string, Record<string, string>>> => {
  await loadFonts();
  
  return {
    Amiri: amiriFontBase64
  };
};

/**
 * Default styles for Arabic PDF document
 */
export const getArabicDocumentStyles = () => {
  return {
    header: {
      fontSize: 18,
      bold: true,
      alignment: 'center',
      margin: [0, 0, 0, 10]
    },
    subheader: {
      fontSize: 14,
      bold: true,
      margin: [0, 10, 0, 5]
    },
    tableHeader: {
      bold: true,
      fontSize: 12,
      color: 'black',
      alignment: 'center'
    },
    defaultStyle: {
      font: 'Amiri',
      fontSize: 12,
      alignment: 'right',
      direction: 'rtl'
    }
  };
};
