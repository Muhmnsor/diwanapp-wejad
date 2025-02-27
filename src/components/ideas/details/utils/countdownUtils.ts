
export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const calculateTimeRemaining = (
  discussion_period: string | undefined,
  created_at: string
): CountdownTime => {
  try {
    // إذا لم تكن هناك فترة مناقشة
    if (!discussion_period) {
      console.log("لا توجد فترة مناقشة محددة");
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    console.log("=== معلومات الوقت المتبقي ===");
    console.log("نوع فترة المناقشة:", typeof discussion_period);
    console.log("فترة المناقشة الأصلية:", discussion_period);
    
    let totalHours = 0;
    
    // التحقق مما إذا كانت فترة المناقشة بتنسيق "X days Y hours"
    if (discussion_period.includes('days') || discussion_period.includes('day') || 
        discussion_period.includes('hours') || discussion_period.includes('hour')) {
      console.log("تم اكتشاف صيغة days/hours");
      
      const parts = discussion_period.split(' ');
      
      // حساب إجمالي الساعات من الأيام والساعات
      for (let i = 0; i < parts.length; i++) {
        if ((parts[i] === 'days' || parts[i] === 'day') && i > 0) {
          const days = parseInt(parts[i-1]);
          if (!isNaN(days)) {
            totalHours += days * 24;
            console.log(`تم إضافة ${days} يوم (${days * 24} ساعة) للمجموع`);
          }
        }
        if ((parts[i] === 'hours' || parts[i] === 'hour') && i > 0) {
          const hours = parseInt(parts[i-1]);
          if (!isNaN(hours)) {
            totalHours += hours;
            console.log(`تم إضافة ${hours} ساعة للمجموع`);
          }
        }
      }
    } 
    // تحقق من تنسيق "HH:MM:SS"
    else if (discussion_period.includes(':')) {
      console.log("تم اكتشاف صيغة HH:MM:SS");
      const timeParts = discussion_period.split(':');
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);
        
        if (!isNaN(hours)) {
          totalHours += hours;
          console.log(`تم إضافة ${hours} ساعة للمجموع`);
        }
        
        if (!isNaN(minutes)) {
          totalHours += minutes / 60;
          console.log(`تم إضافة ${minutes} دقيقة (${minutes/60} ساعة) للمجموع`);
        }
      }
    }
    // محاولة تفسير القيمة كرقم (عدد الساعات)
    else {
      console.log("محاولة تفسير القيمة كعدد ساعات");
      const hours = parseFloat(discussion_period);
      if (!isNaN(hours)) {
        totalHours = hours;
        console.log(`تم تفسير القيمة ${hours} كعدد ساعات`);
      }
    }

    console.log("إجمالي الساعات المحسوبة:", totalHours);

    if (totalHours <= 0) {
      console.log("تحذير: إجمالي الساعات المحسوبة هو صفر أو أقل");
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const createdDate = new Date(created_at);
    console.log("تاريخ الإنشاء:", createdDate.toLocaleString());
    
    const discussionEndDate = new Date(createdDate.getTime() + (totalHours * 60 * 60 * 1000));
    console.log("تاريخ انتهاء المناقشة:", discussionEndDate.toLocaleString());
    
    const now = new Date();
    console.log("الوقت الحالي:", now.toLocaleString());
    
    const diffInMs = discussionEndDate.getTime() - now.getTime();
    console.log("الفرق بالميلي ثانية:", diffInMs);
    
    // التحقق مما إذا كانت المناقشة قد انتهت بالفعل
    if (diffInMs <= 0) {
      console.log("حالة المناقشة: انتهت المناقشة");
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    // حساب الفرق بين الوقت الحالي ووقت انتهاء المناقشة
    const diffInSecs = Math.floor(diffInMs / 1000);
    
    const days = Math.floor(diffInSecs / (24 * 60 * 60));
    const hours = Math.floor((diffInSecs % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((diffInSecs % (60 * 60)) / 60);
    const seconds = Math.floor(diffInSecs % 60);

    console.log("الوقت المتبقي:", {
      أيام: days,
      ساعات: hours,
      دقائق: minutes,
      ثواني: seconds
    });

    return { days, hours, minutes, seconds };
  } catch (error) {
    console.error('Error calculating time left:', error);
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
};

export const formatCountdown = (countdown: CountdownTime): string => {
  const displayParts = [];
  if (countdown.days > 0) {
    displayParts.push(`${countdown.days} يوم`);
  }
  if (countdown.hours > 0) {
    displayParts.push(`${countdown.hours} ساعة`);
  }
  if (countdown.minutes > 0) {
    displayParts.push(`${countdown.minutes} دقيقة`);
  }
  if (countdown.seconds > 0) {
    displayParts.push(`${countdown.seconds} ثانية`);
  }

  return displayParts.length > 0 ? displayParts.join(' و ') : "أقل من دقيقة";
};

export const getCountdownDisplay = (
  discussion_period: string | undefined,
  created_at: string,
  countdown: CountdownTime
): string => {
  // إذا لم تكن هناك فترة مناقشة
  if (!discussion_period) {
    return "غير محدد";
  }

  // إذا كانت هناك أيام أو ساعات أو دقائق أو ثواني متبقية، نعرضها
  if (countdown.days > 0 || countdown.hours > 0 || countdown.minutes > 0 || countdown.seconds > 0) {
    return formatCountdown(countdown);
  }

  // إذا وصلنا إلى هنا، فالمناقشة انتهت
  return "انتهت المناقشة";
};

export const isDiscussionActive = (
  discussion_period: string | undefined,
  created_at: string
): boolean => {
  if (!discussion_period) return false;
  
  try {
    const timeRemaining = calculateTimeRemaining(discussion_period, created_at);
    return timeRemaining.days > 0 || timeRemaining.hours > 0 || 
           timeRemaining.minutes > 0 || timeRemaining.seconds > 0;
  } catch (error) {
    console.error('Error in isDiscussionActive:', error);
    return false;
  }
};
