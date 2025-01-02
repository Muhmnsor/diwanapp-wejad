import JSZip from 'jszip';
import { Report } from '@/types/report';
import { fetchActivityFeedback, fetchEventFeedback } from './feedbackUtils';
import { generateReportContent } from './reportContentGenerator';
import { parsePhotos, downloadPhotos } from './photoUtils';

export const downloadReportWithImages = async (
  report: Report,
  eventTitle?: string
) => {
  try {
    const zip = new JSZip();
    
    // Fetch feedback based on whether it's an activity or event report
    const feedbackSummary = report.activity_id ? 
      await fetchActivityFeedback(report.activity_id) :
      await fetchEventFeedback(report.event_id);
    
    console.log('Feedback summary:', feedbackSummary);

    // Parse photos array
    const parsedPhotos = parsePhotos(report.photos);
    console.log('Parsed photos:', parsedPhotos);

    // Generate report content
    const reportContent = generateReportContent(report, eventTitle, feedbackSummary, parsedPhotos);

    // Add report content to zip
    zip.file('تقرير.txt', reportContent);

    // Handle photos
    const imagesFolder = zip.folder("الصور");
    if (!imagesFolder) throw new Error('Failed to create images folder');

    await downloadPhotos(parsedPhotos, imagesFolder);

    // Generate and download zip file
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