
/**
 * Utilities for handling Arabic text in PDF documents
 */

// Map for Arabic character reshaping (simplified approach)
const arabicCharMap: Record<string, string> = {
  // Add specific character mappings if needed
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
export const getArabicFontDefinition = () => {
  return {
    Amiri: {
      normal: 'https://cdn.jsdelivr.net/npm/amiri-font@0.7.0/amiri-regular.ttf',
      bold: 'https://cdn.jsdelivr.net/npm/amiri-font@0.7.0/amiri-bold.ttf',
      italics: 'https://cdn.jsdelivr.net/npm/amiri-font@0.7.0/amiri-slanted.ttf',
      bolditalics: 'https://cdn.jsdelivr.net/npm/amiri-font@0.7.0/amiri-boldslanted.ttf'
    }
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
