
// This file adds TypeScript type declarations for jspdf-autotable

declare module 'jspdf-autotable' {
  // This is a dummy declaration just to make TypeScript aware of the module
  // The actual functionality is added to the jsPDF prototype
  const plugin: any;
  export default plugin;
}

// Extend the jsPDF type to include the methods added by jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    addFileToVFS(filename: string, fileData: string | ArrayBuffer): void;
    addFont(fontName: string, fontStyle: string, fontAbout: string, postScriptName?: string): void;
    existsFileInVFS(filename: string): boolean;
    getFileFromVFS(filename: string): string;
    autotable: (options: any) => jsPDF;
  }
}
