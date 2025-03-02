
export const calculateNewDiscussionPeriod = (
  operation: string,
  totalCurrentHours: number,
  userInputHours: number
): string => {
  // حساب الساعات الجديدة بناءً على نوع العملية
  let newTotalHours = 0;
  
  if (operation === "add") {
    // في حالة الإضافة، نضيف الساعات الجديدة إلى إجمالي الساعات الحالية
    newTotalHours = totalCurrentHours + userInputHours;
  } else {
    // في حالة التنقيص، نطرح الساعات من إجمالي الساعات الحالية
    newTotalHours = Math.max(0, totalCurrentHours - userInputHours);
  }

  console.log("Current total hours:", totalCurrentHours);
  console.log("User input hours:", userInputHours);
  console.log("Operation:", operation);
  console.log("New total hours:", newTotalHours);
  
  // صياغة فترة المناقشة الجديدة بالشكل الصحيح
  const finalDays = Math.floor(newTotalHours / 24);
  const finalHours = Math.floor(newTotalHours % 24);
  
  const daysText = finalDays === 1 ? "day" : "days";
  const hoursText = finalHours === 1 ? "hour" : "hours";
  
  let newDiscussionPeriod = "";
  if (finalDays > 0) {
    newDiscussionPeriod += `${finalDays} ${daysText}`;
  }
  if (finalHours > 0) {
    if (newDiscussionPeriod) newDiscussionPeriod += " ";
    newDiscussionPeriod += `${finalHours} ${hoursText}`;
  }
  
  // إذا كانت الفترة فارغة (حالة خاصة) نضع قيمة افتراضية
  if (!newDiscussionPeriod) {
    newDiscussionPeriod = "0 hours";
  }
  
  console.log("New discussion period:", newDiscussionPeriod);
  return newDiscussionPeriod;
};

export const formatPeriodDisplay = (days: number, hours: number): string => {
  if (days === 0 && hours === 0) {
    return "غير محددة";
  }
  
  const parts = [];
  if (days > 0) {
    parts.push(`${days} يوم`);
  }
  if (hours > 0) {
    parts.push(`${hours} ساعة`);
  }
  
  return parts.join(" و ");
};
