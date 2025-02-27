
export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const calculateTimeRemaining = (discussionPeriod: string, createdAt: string): CountdownTime => {
  console.log("=== معلومات الوقت المتبقي ===");
  console.log("نوع فترة المناقشة:", typeof discussionPeriod);
  console.log("فترة المناقشة الأصلية:", discussionPeriod);
  
  // تحويل فترة المناقشة إلى ساعات
  let totalHours = 0;
  
  if (discussionPeriod.includes('day')) {
    const days = parseInt(discussionPeriod);
    totalHours = days * 24;
    console.log("تم إضافة", days, "يوم للمجموع");
  } else if (discussionPeriod.includes('hour')) {
    totalHours = parseInt(discussionPeriod);
    console.log("تم إضافة", totalHours, "ساعة للمجموع");
  } else {
    // تحليل الصيغة 'X days/hours'
    console.log("تم اكتشاف صيغة days/hours");
    const value = parseInt(discussionPeriod);
    if (!isNaN(value)) {
      totalHours = value;
      console.log("تم إضافة", value, "ساعة للمجموع");
    }
  }
  
  console.log("إجمالي الساعات المحسوبة:", totalHours);
  
  // تحويل تاريخ الإنشاء إلى كائن Date
  const createdDate = new Date(createdAt);
  console.log("تاريخ الإنشاء:", createdDate.toLocaleString());
  
  // حساب تاريخ انتهاء المناقشة
  const endDate = new Date(createdDate.getTime() + (totalHours * 60 * 60 * 1000));
  console.log("تاريخ انتهاء المناقشة:", endDate.toLocaleString());
  
  // الوقت الحالي
  const now = new Date();
  console.log("الوقت الحالي:", now.toLocaleString());
  
  // حساب الفرق بالميلي ثانية
  const timeDiff = endDate.getTime() - now.getTime();
  console.log("الفرق بالميلي ثانية:", timeDiff);
  
  // إذا انتهى الوقت، نرجع أصفار
  if (timeDiff <= 0) {
    console.log("حالة المناقشة: انتهت المناقشة");
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }
  
  // حساب الوقت المتبقي
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
  
  console.log("حالة المناقشة: المناقشة جارية");
  console.log("الوقت المتبقي:", { days, hours, minutes, seconds });
  
  return { days, hours, minutes, seconds };
};

export const getCountdownDisplay = (discussionPeriod: string, createdAt: string, time: CountdownTime): string => {
  if (!discussionPeriod || !createdAt) {
    return "غير محدد";
  }
  
  if (time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0) {
    return "انتهت المناقشة";
  }
  
  if (time.days > 0) {
    return `${time.days} يوم ${time.hours} ساعة`;
  }
  
  if (time.hours > 0) {
    return `${time.hours} ساعة ${time.minutes} دقيقة`;
  }
  
  if (time.minutes > 0) {
    return `${time.minutes} دقيقة`;
  }
  
  return `${time.seconds} ثانية`;
};
