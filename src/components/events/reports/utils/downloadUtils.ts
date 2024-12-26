import JSZip from 'jszip';

export const downloadReportWithImages = async (
  report: {
    report_text: string;
    detailed_description: string;
    event_duration: string;
    attendees_count: string;
    event_objectives: string;
    impact_on_participants: string;
    created_at: string;
    photos: Array<{ url: string; description: string }>;
  },
  eventTitle?: string
) => {
  try {
    const zip = new JSZip();
    
    // Create report text content
    const reportContent = `تقرير الفعالية
${eventTitle ? `اسم الفعالية: ${eventTitle}` : ''}
التاريخ: ${new Date(report.created_at).toLocaleDateString('ar')}

نص التقرير:
${report.report_text}

التفاصيل:
${report.detailed_description}

معلومات الفعالية:
- المدة: ${report.event_duration}
- عدد المشاركين: ${report.attendees_count}

الأهداف:
${report.event_objectives}

الأثر على المشاركين:
${report.impact_on_participants}

الصور المرفقة:
${report.photos.map((photo, index) => `${index + 1}. ${photo.description || `صورة ${index + 1}`}`).join('\n')}`;

    // Add report text file
    zip.file('تقرير-الفعالية.txt', reportContent);

    // Create images folder
    const imagesFolder = zip.folder("الصور");

    // Download and add images
    const downloadPromises = report.photos.map(async (photo, index) => {
      try {
        const response = await fetch(photo.url);
        const blob = await response.blob();
        const extension = photo.url.split('.').pop() || 'jpg';
        const fileName = `صورة-${index + 1}-${photo.description || ''}.${extension}`;
        imagesFolder?.file(fileName, blob);
      } catch (error) {
        console.error(`Error downloading image ${index}:`, error);
      }
    });

    await Promise.all(downloadPromises);

    // Generate and download zip file
    const content = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير-الفعالية-${new Date(report.created_at).toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error creating zip file:', error);
    return false;
  }
};