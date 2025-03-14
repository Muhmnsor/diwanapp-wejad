
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFontsModule from "pdfmake/build/vfs_fonts";

// Initialize pdfMake with virtual file system for fonts
// Different versions of pdfMake might have different module structures
// Cast to any to avoid TypeScript errors with the VFS property access
const pdfFontsVfs = (pdfFontsModule as any).pdfFonts?.vfs || (pdfFontsModule as any).vfs;
(pdfMake as any).vfs = pdfFontsVfs;

// Register custom fonts for Arabic support
export const customFonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  },
  Amiri: {
    normal: 'https://cdn.jsdelivr.net/npm/amiri-font@0.4.0/amiri-regular.ttf',
    bold: 'https://cdn.jsdelivr.net/npm/amiri-font@0.4.0/amiri-bold.ttf',
    italics: 'https://cdn.jsdelivr.net/npm/amiri-font@0.4.0/amiri-slanted.ttf',
    bolditalics: 'https://cdn.jsdelivr.net/npm/amiri-font@0.4.0/amiri-boldslanted.ttf'
  }
};
