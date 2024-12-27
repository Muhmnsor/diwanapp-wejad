export const formatEventPath = (path?: string) => {
  if (!path) return '';
  const pathMap: Record<string, string> = {
    'environment': 'البيئة',
    'community': 'المجتمع',
    'content': 'المحتوى'
  };
  return pathMap[path] || path;
};

export const formatEventCategory = (category?: string) => {
  if (!category) return '';
  const categoryMap: Record<string, string> = {
    'social': 'اجتماعي',
    'entertainment': 'ترفيهي',
    'service': 'خدمي',
    'educational': 'تعليمي',
    'consulting': 'استشاري',
    'interest': 'اهتمام',
    'specialization': 'تخصص',
    'spiritual': 'روحي',
    'cultural': 'ثقافي',
    'behavioral': 'سلوكي',
    'skill': 'مهاري',
    'health': 'صحي',
    'diverse': 'متنوع'
  };
  return categoryMap[category] || category;
};