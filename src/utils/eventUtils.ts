export const arabicToEnglishNum = (str: string) => {
  return str.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
};

export const convertArabicDate = (dateStr: string, timeStr: string) => {
  const [day, month, year] = dateStr.split(' ');
  const arabicMonths: { [key: string]: string } = {
    'يناير': 'January', 'فبراير': 'February', 'مارس': 'March',
    'ابريل': 'April', 'مايو': 'May', 'يونيو': 'June',
    'يوليو': 'July', 'اغسطس': 'August', 'سبتمبر': 'September',
    'اكتوبر': 'October', 'نوفمبر': 'November', 'ديسمبر': 'December'
  };
  
  const englishMonth = arabicMonths[month] || month;
  return `${englishMonth} ${day} ${year} ${timeStr.replace('ص', 'AM').replace('م', 'PM')}`;
};