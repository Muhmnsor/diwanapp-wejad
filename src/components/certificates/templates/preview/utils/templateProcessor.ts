import { PDFDocument } from 'pdf-lib';

export const processTemplate = async (pdfBytes: ArrayBuffer, previewData: Record<string, string>) => {
  try {
    console.log('🔄 Processing template with data:', previewData);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // Fill form fields with preview data
    Object.entries(previewData).forEach(([key, value]) => {
      try {
        const field = form.getTextField(key);
        if (field) {
          field.setText(value);
        }
      } catch (error) {
        console.warn(`⚠️ Field not found or error setting value for: ${key}`, error);
      }
    });

    // Flatten form fields
    form.flatten();

    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    return new Blob([modifiedPdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('❌ Error processing template:', error);
    throw new Error('Failed to process template');
  }
};