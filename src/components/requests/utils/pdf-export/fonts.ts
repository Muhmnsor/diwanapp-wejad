
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFontsModule from "pdfmake/build/vfs_fonts";

// Initialize pdfMake with virtual file system for fonts
// The VFS is directly available on the module in most pdfMake distributions
(pdfMake as any).vfs = pdfFontsModule.pdfFonts ? pdfFontsModule.pdfFonts.vfs : pdfFontsModule.vfs;

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
