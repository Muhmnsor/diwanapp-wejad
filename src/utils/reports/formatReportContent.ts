import { ProjectReport } from '@/types/projectReport';

const formatValue = (value: string | null | undefined): string => {
  if (!value || value.trim() === '') return 'لا يوجد';
  return value;
};

const calculateAverage = (ratings: (number | null)[]): number => {
  const validRatings = ratings.filter((r): r is number => r !== null);
  if (validRatings.length === 0) return 0;
  return validRatings.reduce((a, b) => a + b, 0) / validRatings.length;
};

const formatRating = (rating: number): string => {
  return `${rating.toFixed(1)} من 5`;
};

export const generateReportContent = (report: ProjectReport): string => {
  // Calculate averages if feedback exists
  const feedback = report.activity?.activity_feedback || [];
  const ratings = {
    overall: calculateAverage(feedback.map(f => f.overall_rating)),
    content: calculateAverage(feedback.map(f => f.content_rating)),
    organization: calculateAverage(feedback.map(f => f.organization_rating)),
    presenter: calculateAverage(feedback.map(f => f.presenter_rating))
  };

  const sections = [
    {
      title: 'اسم النشاط',
      value: report.activity?.title || 'غير محدد'
    },
    {
      title: 'اسم البرنامج',
      value: formatValue(report.program_name)
    },
    {
      title: 'اسم التقرير',
      value: formatValue(report.report_name)
    },
    {
      title: 'مدة النشاط',
      value: `${formatValue(report.activity_duration)} ساعة`
    },
    {
      title: 'عدد الحضور',
      value: formatValue(report.attendees_count)
    },
    {
      title: 'أهداف النشاط',
      value: formatValue(report.activity_objectives)
    },
    {
      title: 'الأثر على المشاركين',
      value: formatValue(report.impact_on_participants)
    },
    {
      title: 'نص التقرير',
      value: formatValue(report.report_text)
    }
  ];

  // Add feedback section if there are ratings
  if (feedback.length > 0) {
    sections.push(
      {
        title: 'نتائج التقييم',
        value: `عدد المقيمين: ${feedback.length}\n\n` +
               `التقييم العام: ${formatRating(ratings.overall)}\n` +
               `تقييم المحتوى: ${formatRating(ratings.content)}\n` +
               `تقييم التنظيم: ${formatRating(ratings.organization)}\n` +
               `تقييم المقدم: ${formatRating(ratings.presenter)}`
      }
    );
  }

  // Add photos section if there are photos
  if (report.photos && report.photos.length > 0) {
    const photoUrls = report.photos
      .filter(photo => {
        try {
          const parsedPhoto = typeof photo === 'string' ? JSON.parse(photo) : photo;
          return parsedPhoto && parsedPhoto.url;
        } catch (e) {
          console.error('Error parsing photo:', e);
          return false;
        }
      })
      .map((photo, index) => {
        const parsedPhoto = typeof photo === 'string' ? JSON.parse(photo) : photo;
        return `صورة ${index + 1}: ${parsedPhoto.url}`;
      });

    if (photoUrls.length > 0) {
      sections.push({
        title: 'روابط الصور',
        value: photoUrls.join('\n')
      });
    }
  }

  // Add a separator line
  const separator = '='.repeat(50);
  
  // Format the content with proper spacing and separators
  return `تقرير النشاط\n${separator}\n\n` + 
    sections
      .map(section => `${section.title}:\n${section.value}\n`)
      .join('\n' + separator + '\n\n');
};