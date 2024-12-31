export const translateEducationLevel = (level?: string) => {
  const educationLevels: Record<string, string> = {
    'primary': 'ابتدائي',
    'intermediate': 'متوسط',
    'high_school': 'ثانوي',
    'bachelor': 'بكالوريوس',
    'master': 'ماجستير',
    'phd': 'دكتوراه'
  };
  return level ? educationLevels[level] || level : '-';
};

export const translateWorkStatus = (status?: string) => {
  const workStatuses: Record<string, string> = {
    'employed': 'موظف',
    'unemployed': 'غير موظف',
    'student': 'طالب',
    'retired': 'متقاعد'
  };
  return status ? workStatuses[status] || status : '-';
};