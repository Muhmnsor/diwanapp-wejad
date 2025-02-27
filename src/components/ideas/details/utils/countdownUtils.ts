
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
    
    // التحقق مما إذا كانت فترة المناقشة هي كائن تاريخ (إذا كان التنسيق كذلك)
    if (discussion_period.includes('days') || discussion_period.includes('day') || 
        discussion_period.includes('hours') || discussion_period.includes('hour')) {
      console.log("تم اكتشاف صيغة days/hours");
      
      const parts = discussion_period.split(' ');
      let totalHours = 0;

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
    } else {
      // إذا كانت فترة المناقشة ليست بالتنسيق المعروف، نحاول تفسيرها كفترة زمنية
      console.log("تحذير: فترة المناقشة ليست بالتنسيق المتوقع:", discussion_period);
      
      // محاولة تفسير الفترة كرقم (ساعات)
      const hours = parseFloat(discussion_period);
      
      if (!isNaN(hours)) {
        console.log("تم تفسير فترة المناقشة كـ", hours, "ساعة");
        
        const createdDate = new Date(created_at);
        console.log("تاريخ الإنشاء:", createdDate.toLocaleString());
        
        const discussionEndDate = new Date(createdDate.getTime() + (hours * 60 * 60 * 1000));
        console.log("تاريخ انتهاء المناقشة:", discussionEndDate.toLocaleString());
        
        const now = new Date();
        console.log("الوقت الحالي:", now.toLocaleString());
        
        const diffInMs = discussionEndDate.getTime() - now.getTime();
        console.log("الفرق بالميلي ثانية:", diffInMs);
        
        if (diffInMs <= 0) {
          console.log("حالة المناقشة: انتهت المناقشة");
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        
        const diffInSecs = Math.floor(diffInMs / 1000);
        
        const days = Math.floor(diffInSecs / (24 * 60 * 60));
        const hoursLeft = Math.floor((diffInSecs % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((diffInSecs % (60 * 60)) / 60);
        const seconds = Math.floor(diffInSecs % 60);
        
        console.log("الوقت المتبقي:", {
          أيام: days,
          ساعات: hoursLeft,
          دقائق: minutes,
          ثواني: seconds
        });
        
        return { days, hours: hoursLeft, minutes, seconds };
      }
      
      // إذا وصلنا هنا، فلم نتمكن من تفسير الفترة بأي شكل معروف
      console.error("غير قادر على تفسير فترة المناقشة:", discussion_period);
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
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

  // إذا وصلنا إلى هنا، قد تكون المناقشة قد انتهت أو هناك مشكلة في حساب الوقت المتبقي
  // نحاول حساب ما إذا كانت المناقشة قد انتهت
  try {
    let totalHours = 0;
    
    if (discussion_period.includes('days') || discussion_period.includes('day') || 
        discussion_period.includes('hours') || discussion_period.includes('hour')) {
      const parts = discussion_period.split(' ');
      
      for (let i = 0; i < parts.length; i++) {
        if ((parts[i] === 'days' || parts[i] === 'day') && i > 0) {
          const days = parseInt(parts[i-1]);
          if (!isNaN(days)) totalHours += days * 24;
        }
        if ((parts[i] === 'hours' || parts[i] === 'hour') && i > 0) {
          const hours = parseInt(parts[i-1]);
          if (!isNaN(hours)) totalHours += hours;
        }
      }
    } else {
      // محاولة تفسير الفترة كرقم (ساعات)
      const hours = parseFloat(discussion_period);
      if (!isNaN(hours)) {
        totalHours = hours;
      }
    }
    
    if (totalHours <= 0) {
      return "فترة مناقشة غير صالحة";
    }
    
    const createdDate = new Date(created_at);
    const discussionEndDate = new Date(createdDate.getTime() + (totalHours * 60 * 60 * 1000));
    const now = new Date();
    
    if (now >= discussionEndDate) {
      return "انتهت المناقشة";
    }
    
    // إذا وصلنا إلى هنا، فهناك وقت متبقي أقل من دقيقة
    return "أقل من دقيقة";
  } catch (error) {
    console.error('Error in getCountdownDisplay:', error);
    return "خطأ في حساب الوقت المتبقي";
  }
};

export const isDiscussionActive = (
  discussion_period: string | undefined,
  created_at: string
): boolean => {
  if (!discussion_period) return false;
  
  try {
    let totalHours = 0;
    
    if (discussion_period.includes('days') || discussion_period.includes('day') || 
        discussion_period.includes('hours') || discussion_period.includes('hour')) {
      const parts = discussion_period.split(' ');
      
      for (let i = 0; i < parts.length; i++) {
        if ((parts[i] === 'days' || parts[i] === 'day') && i > 0) {
          const days = parseInt(parts[i-1]);
          if (!isNaN(days)) totalHours += days * 24;
        }
        if ((parts[i] === 'hours' || parts[i] === 'hour') && i > 0) {
          const hours = parseInt(parts[i-1]);
          if (!isNaN(hours)) totalHours += hours;
        }
      }
    } else {
      // محاولة تفسير الفترة كرقم (ساعات)
      const hours = parseFloat(discussion_period);
      if (!isNaN(hours)) {
        totalHours = hours;
      }
    }
    
    if (totalHours <= 0) return false;
    
    const createdDate = new Date(created_at);
    const discussionEndDate = new Date(createdDate.getTime() + (totalHours * 60 * 60 * 1000));
    const now = new Date();
    
    return now < discussionEndDate;
  } catch (error) {
    console.error('Error in isDiscussionActive:', error);
    return false;
  }
};
