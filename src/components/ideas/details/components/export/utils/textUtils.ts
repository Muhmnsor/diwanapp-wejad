
/**
 * Generate text content for idea
 */
export const generateIdeaTextContent = (idea: any): string => {
  // Determine the idea status in a more readable format
  let ideaStatus = '';
  if (idea.status === 'pending') {
    ideaStatus = 'قيد المراجعة';
  } else if (idea.status === 'discussing') {
    ideaStatus = 'قيد المناقشة';
  } else if (idea.status === 'approved') {
    ideaStatus = 'تمت الموافقة';
  } else if (idea.status === 'rejected') {
    ideaStatus = 'مرفوضة';
  } else if (idea.status === 'archived') {
    ideaStatus = 'مؤرشفة';
  } else {
    ideaStatus = idea.status || 'غير معروف';
  }

  // Format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'غير محدد';
    try {
      return new Date(dateString).toLocaleString('ar-SA');
    } catch (e) {
      return dateString;
    }
  };

  // Generate the text content
  return `
عنوان الفكرة: ${idea.title || 'بدون عنوان'}
===================================

معلومات عامة:
-----------
الحالة: ${ideaStatus}
نوع الفكرة: ${idea.idea_type || 'غير محدد'}
تاريخ الإنشاء: ${formatDate(idea.created_at)}
مدة المناقشة: ${idea.duration || 'غير محدد'}

الوصف:
-----
${idea.description || 'لا يوجد وصف'}

المشكلة:
-------
${idea.problem || 'لم يتم تحديد مشكلة'}

الفرصة:
------
${idea.opportunity || 'لم يتم تحديد فرصة'}

الفوائد:
-------
${idea.benefits || 'لم يتم تحديد فوائد'}

آلية التنفيذ:
----------
${idea.execution || 'لم يتم تحديد آلية التنفيذ'}

الموارد المطلوبة:
--------------
${idea.resources || 'لم يتم تحديد موارد مطلوبة'}

التكاليف المتوقعة:
---------------
${idea.cost || 'لم يتم تحديد تكاليف متوقعة'}

الإدارات المعنية:
--------------
${Array.isArray(idea.departments) ? idea.departments.join('، ') : (idea.departments || 'لم يتم تحديد إدارات معنية')}

الشركاء:
------
${Array.isArray(idea.partners) ? idea.partners.join('، ') : (idea.partners || 'لم يتم تحديد شركاء')}

الأفكار المشابهة:
--------------
${Array.isArray(idea.similar_ideas) ? idea.similar_ideas.map((similarIdea: any) => 
  `- ${similarIdea.title || 'بدون عنوان'}: ${similarIdea.link || 'بدون رابط'}`
).join('\n') : 'لم يتم تحديد أفكار مشابهة'}

الملفات الداعمة:
-------------
${Array.isArray(idea.supporting_files) && idea.supporting_files.length > 0 ? 
  idea.supporting_files.map((file: any, index: number) => 
    `${index + 1}. ${file.name || 'ملف بدون اسم'}`
  ).join('\n') : 
  'لا توجد ملفات داعمة'}
`;
};

/**
 * Generate text content for comments
 */
export const generateCommentsTextContent = (comments: any[]): string => {
  if (!comments || comments.length === 0) {
    return "لا توجد تعليقات";
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'غير محدد';
    try {
      return new Date(dateString).toLocaleString('ar-SA');
    } catch (e) {
      return dateString;
    }
  };

  const formattedComments = comments.map((comment, index) => {
    let commentText = `${index + 1}. تعليق بواسطة: ${comment.user_email || 'مستخدم غير معروف'}\n`;
    commentText += `   التاريخ: ${formatDate(comment.created_at)}\n`;
    commentText += `   المحتوى: ${comment.content || 'بدون محتوى'}\n`;
    
    if (comment.attachment_url) {
      commentText += `   المرفق: ${comment.attachment_name || 'ملف مرفق'}\n`;
    }
    
    return commentText;
  }).join('\n');

  return `
التعليقات:
========
${formattedComments}
`;
};

/**
 * Generate text content for votes
 */
export const generateVotesTextContent = (votes: any[]): string => {
  if (!votes || votes.length === 0) {
    return "لا توجد أصوات";
  }

  // Count upvotes and downvotes
  const upvotes = votes.filter(vote => vote.vote_type === 'up').length;
  const downvotes = votes.filter(vote => vote.vote_type === 'down').length;

  return `
التصويت:
=======
إجمالي الأصوات: ${votes.length}
الأصوات المؤيدة: ${upvotes}
الأصوات المعارضة: ${downvotes}
`;
};

/**
 * Generate text content for decision
 */
export const generateDecisionTextContent = (decision: any): string => {
  if (!decision) {
    return "لم يتم اتخاذ قرار بعد";
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'غير محدد';
    try {
      return new Date(dateString).toLocaleString('ar-SA');
    } catch (e) {
      return dateString;
    }
  };

  return `
القرار:
=====
تاريخ القرار: ${formatDate(decision.created_at)}
نتيجة القرار: ${decision.outcome || 'غير محدد'}
التعليق: ${decision.comments || 'بدون تعليق'}
النقاط البارزة: ${decision.highlights || 'لا توجد نقاط بارزة'}
المعينون: ${Array.isArray(decision.assignees) && decision.assignees.length > 0 ? 
  decision.assignees.map((assignee: any) => assignee.name || 'بدون اسم').join('، ') : 
  'لم يتم تعيين أحد'}
`;
};

/**
 * Sanitize file name to be safe for file systems
 */
export const sanitizeFileName = (fileName: string): string => {
  if (!fileName) return 'file';
  
  try {
    // Replace invalid characters with underscores
    let safeFileName = fileName
      .replace(/[\/\\:*?"<>|]/g, '_')  // Replace invalid characters
      .replace(/\s+/g, '_')            // Replace spaces with underscores
      .replace(/__+/g, '_')            // Replace multiple underscores with single
      .trim();                          // Trim any whitespace
    
    // If filename is too long, truncate it
    if (safeFileName.length > 100) {
      const extension = safeFileName.includes('.') ? 
        safeFileName.substring(safeFileName.lastIndexOf('.')) : '';
      const nameWithoutExt = safeFileName.includes('.') ? 
        safeFileName.substring(0, safeFileName.lastIndexOf('.')) : safeFileName;
      
      safeFileName = nameWithoutExt.substring(0, 90) + extension;
    }
    
    // If filename starts with a dot, add a prefix
    if (safeFileName.startsWith('.')) {
      safeFileName = 'file' + safeFileName;
    }
    
    // If filename is empty after sanitization, use a default name
    if (!safeFileName) {
      safeFileName = 'file';
    }
    
    console.log(`اسم الملف الأصلي: ${fileName} | اسم الملف المعدل: ${safeFileName}`);
    
    return safeFileName;
  } catch (error) {
    console.error(`خطأ أثناء تنظيف اسم الملف "${fileName}":`, error);
    return 'file';  // Return a default name in case of error
  }
};
