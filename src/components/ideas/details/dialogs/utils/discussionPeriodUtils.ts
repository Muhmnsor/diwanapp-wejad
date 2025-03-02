
/**
 * تنسيق فترة المناقشة بالشكل الصحيح
 */
export const formatDiscussionPeriod = (totalHours: number): string => {
  const finalDays = Math.floor(totalHours / 24);
  const finalHours = Math.floor(totalHours % 24);
  
  const daysText = finalDays === 1 ? "day" : "days";
  const hoursText = finalHours === 1 ? "hour" : "hours";
  
  let formattedPeriod = "";
  if (finalDays > 0) {
    formattedPeriod += `${finalDays} ${daysText}`;
  }
  if (finalHours > 0) {
    if (formattedPeriod) formattedPeriod += " ";
    formattedPeriod += `${finalHours} ${hoursText}`;
  }
  
  // إذا كانت الفترة فارغة (حالة خاصة) نضع قيمة افتراضية
  if (!formattedPeriod) {
    formattedPeriod = "0 hours";
  }
  
  return formattedPeriod;
};

/**
 * حساب إجمالي الساعات الجديدة بناءً على نوع العملية
 */
export const calculateNewTotalHours = (
  currentHours: number, 
  inputHours: number, 
  operation: "add" | "subtract"
): number => {
  if (operation === "add") {
    return currentHours + inputHours;
  } else {
    return Math.max(0, currentHours - inputHours);
  }
};
