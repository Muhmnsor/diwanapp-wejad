import JSZip from 'jszip';
import { Report } from '@/types/report';
import { fetchFeedbackSummary } from './feedback';
import { parsePhotos, downloadPhotos } from './photos';
import { generateReportContent } from './reportContent';

export const downloadReportWithImages = async (
  report: Report,
  eventTitle?: string
) => {
  try {
    console.log('Starting report download process:', { report, eventTitle });
    const zip = new JSZip();
    
    const feedbackSummary = await fetchFeedbackSummary(report.event_id);
    console.log('Feedback summary:', feedbackSummary);

    const parsedPhotos = parsePhotos(report.photos || []);
    console.log('Parsed photos:', parsedPhotos);

    const reportContent = generateReportContent(report, eventTitle, feedbackSummary, parsedPhotos);
    zip.file('تقرير-الفعالية.txt', reportContent);

    if (parsedPhotos.length > 0) {
      const imagesFolder = zip.folder("الصور");
      if (!imagesFolder) throw new Error('Failed to create images folder');
      await downloadPhotos(parsedPhotos, imagesFolder);
    }

    console.log('Generating zip file...');
    const content = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير-${report.report_name || eventTitle || 'الفعالية'}-${new Date(report.created_at).toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('Download completed successfully');
    return true;
  } catch (error) {
    console.error('Error creating zip file:', error);
    return false;
  }
};