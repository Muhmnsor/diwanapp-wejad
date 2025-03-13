
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

// Initialize pdfMake with virtual file system for fonts
(pdfMake as any).vfs = pdfFonts.vfs;

// Register custom fonts for Arabic support
export const pdfFonts = {
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

