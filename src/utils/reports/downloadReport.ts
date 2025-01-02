import { ProjectActivityReport, ReportPhoto } from "@/types/projectReport";
import { supabase } from "@/integrations/supabase/client";
import { saveAs } from "file-saver";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { formatDate } from "@/lib/utils";

const arabicFontUrl = "/fonts/arabic.ttf";

async function fetchFont(url: string) {
  const response = await fetch(url);
  const fontBytes = await response.arrayBuffer();
  return fontBytes;
}

export const downloadReport = async (report: ProjectActivityReport) => {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  
  const fontBytes = await fetchFont(arabicFontUrl);
  const arabicFont = await pdfDoc.embedFont(fontBytes);
  
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  
  const fontSize = 12;
  const lineHeight = fontSize * 1.5;
  let currentY = height - 50;
  
  const drawText = (text: string, y: number) => {
    page.drawText(text, {
      x: width - 50,
      y,
      font: arabicFont,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    return y - lineHeight;
  };

  let content = '';
  content += `اسم التقرير: ${report.report_name}\n`;
  content += `تاريخ النشاط: ${formatDate(report.activity_date)}\n`;
  content += `تقرير النشاط: ${report.report_text}\n`;
  content += `عدد الحضور: ${report.attendance_count}\n`;
  content += `مدة النشاط: ${report.activity_hours} ساعات\n`;
  content += `أهداف النشاط: ${report.objectives}\n`;
  content += `آثار النشاط: ${report.impact}\n`;

  const lines = content.split('\n');
  for (const line of lines) {
    currentY = drawText(line, currentY);
  }

  if (report.photos && report.photos.length > 0) {
    content += '\n\nصور النشاط:\n';
    for (let i = 0; i < report.photos.length; i++) {
      try {
        let photoData: ReportPhoto;
        if (typeof report.photos[i] === 'string') {
          photoData = JSON.parse(report.photos[i] as unknown as string);
        } else {
          photoData = report.photos[i] as ReportPhoto;
        }

        if (!photoData?.url) continue;

        const response = await fetch(photoData.url);
        const imageBytes = await response.arrayBuffer();
        const image = await pdfDoc.embedJpg(imageBytes);
        
        const imgDims = image.scale(0.5);
        
        if (currentY - imgDims.height < 50) {
          page.addPage();
          currentY = height - 50;
        }
        
        page.drawImage(image, {
          x: width - imgDims.width - 50,
          y: currentY - imgDims.height,
          width: imgDims.width,
          height: imgDims.height,
        });
        
        currentY = currentY - imgDims.height - 20;
        
        if (photoData.description) {
          currentY = drawText(photoData.description, currentY);
        }
      } catch (error) {
        console.error('Error processing photo:', error);
        continue;
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  saveAs(blob, `تقرير-${report.report_name}.pdf`);
};