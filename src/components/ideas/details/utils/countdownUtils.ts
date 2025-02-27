
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
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const parts = discussion_period.split(' ');
    let totalHours = 0;

    // حساب إجمالي الساعات من الأيام والساعات
    for (let i = 0; i < parts.length; i++) {
      if ((parts[i] === 'days' || parts[i] === 'day') && i > 0) {
        const days = parseInt(parts[i-1]);
        if (!isNaN(days)) {
          totalHours += days * 24;
        }
      }
      if ((parts[i] === 'hours' || parts[i] === 'hour') && i > 0) {
        const hours = parseInt(parts[i-1]);
        if (!isNaN(hours)) {
          totalHours += hours;
        }
      }
    }

    const createdDate = new Date(created_at);
    const discussionEndDate = new Date(createdDate.getTime() + (totalHours * 60 * 60 * 1000));
    const now = new Date();

    // التحقق مما إذا كانت المناقشة قد انتهت بالفعل
    if (now >= discussionEndDate) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    // حساب الفرق بين الوقت الحالي ووقت انتهاء المناقشة
    const diffInMs = discussionEndDate.getTime() - now.getTime();
    const diffInSecs = Math.floor(diffInMs / 1000);
    
    const days = Math.floor(diffInSecs / (24 * 60 * 60));
    const hours = Math.floor((diffInSecs % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((diffInSecs % (60 * 60)) / 60);
    const seconds = Math.floor(diffInSecs % 60);

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

  const parts = discussion_period.split(' ');
  let totalHours = 0;

  // حساب إجمالي الساعات
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

  // التحقق من صلاحية الفترة
  if (totalHours <= 0) {
    return "فترة مناقشة غير صالحة";
  }

  const createdDate = new Date(created_at);
  const discussionEndDate = new Date(createdDate.getTime() + (totalHours * 60 * 60 * 1000));
  const now = new Date();

  // التحقق من انتهاء المناقشة
  if (now >= discussionEndDate) {
    return "انتهت المناقشة";
  }

  // إذا لم يكن هناك أي وقت متبقي في العداد لكن المناقشة لم تنته بعد
  if (countdown.days === 0 && countdown.hours === 0 && 
      countdown.minutes === 0 && countdown.seconds === 0) {
    const timeLeft = discussionEndDate.getTime() - now.getTime();
    if (timeLeft > 0) {
      return "أقل من دقيقة";
    }
    return "انتهت المناقشة";
  }

  return formatCountdown(countdown);
};

export const isDiscussionActive = (
  discussion_period: string | undefined,
  created_at: string
): boolean => {
  if (!discussion_period) return false;
  
  const parts = discussion_period.split(' ');
  let totalHours = 0;

  // حساب إجمالي الساعات
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

  const createdDate = new Date(created_at);
  const discussionEndDate = new Date(createdDate.getTime() + (totalHours * 60 * 60 * 1000));
  const now = new Date();

  return now < discussionEndDate;
};
