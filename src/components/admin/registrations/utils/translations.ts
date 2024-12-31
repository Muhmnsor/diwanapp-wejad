export const translateEducationLevel = (level?: string) => {
  switch (level) {
    case 'primary':
      return 'ابتدائي';
    case 'intermediate':
      return 'متوسط';
    case 'high_school':
      return 'ثانوي';
    case 'bachelor':
      return 'بكالوريوس';
    case 'master':
      return 'ماجستير';
    case 'phd':
      return 'دكتوراه';
    default:
      return '-';
  }
};

export const translateWorkStatus = (status?: string) => {
  switch (status) {
    case 'employed':
      return 'موظف';
    case 'unemployed':
      return 'غير موظف';
    case 'student':
      return 'طالب';
    case 'retired':
      return 'متقاعد';
    default:
      return '-';
  }
};