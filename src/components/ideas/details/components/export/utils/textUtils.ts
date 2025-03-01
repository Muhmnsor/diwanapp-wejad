
/**
 * Formats departments into human-readable text
 */
export const formatDepartments = (departments: any[]): string => {
  if (!departments || !departments.length) return 'لا توجد إدارات مساهمة';
  
  return departments.map((dept: any, index: number) => {
    let name, contribution;
    if (typeof dept === 'string') {
      try {
        const parsed = JSON.parse(dept);
        name = parsed.name;
        contribution = parsed.contribution;
      } catch (e) {
        name = dept;
        contribution = '';
      }
    } else {
      name = dept.name;
      contribution = dept.contribution;
    }
    
    return `${index + 1}. ${name}${contribution ? ` - المساهمة: ${contribution}` : ''}`;
  }).join('\n');
};

/**
 * Formats partners into human-readable text
 */
export const formatPartners = (partners: any[]): string => {
  if (!partners || !partners.length) return 'لا يوجد شركاء متوقعون';
  
  return partners.map((partner: any, index: number) => {
    return `${index + 1}. ${partner.name}${partner.contribution ? ` - المساهمة: ${partner.contribution}` : ''}`;
  }).join('\n');
};

/**
 * Formats costs into human-readable text
 */
export const formatCosts = (costs: any[]): string => {
  if (!costs || !costs.length) return 'لا توجد تكاليف متوقعة';
  
  let totalCost = 0;
  const costsText = costs.map((cost: any, index: number) => {
    const itemCost = cost.total_cost || 0;
    totalCost += Number(itemCost);
    return `${index + 1}. ${cost.item} - الكمية: ${cost.quantity} - التكلفة: ${itemCost} ريال`;
  }).join('\n');
  
  return `${costsText}\n\nالتكلفة الإجمالية: ${totalCost} ريال`;
};

/**
 * Gets the text representation of a status
 */
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'draft': return 'مسودة';
    case 'under_review': return 'قيد المراجعة';
    case 'pending_decision': return 'بانتظار القرار';
    case 'approved': return 'تمت الموافقة';
    case 'rejected': return 'مرفوضة';
    case 'needs_modification': return 'تحتاج تعديل';
    default: return status || 'غير معروف';
  }
};

/**
 * Sanitizes a filename to remove invalid characters
 */
export const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[\\/:*?"<>|]/g, '_').substring(0, 50);
};

/**
 * Generates text content for an idea
 */
export const generateIdeaTextContent = (ideaData: any): string => {
  const ideaCreatedAt = new Date(ideaData.created_at).toLocaleString('ar');
  return `عنوان الفكرة: ${ideaData.title}
تاريخ الإنشاء: ${ideaCreatedAt}
مقدم الفكرة: ${ideaData.created_by_user?.email || 'غير معروف'}
الحالة: ${getStatusText(ideaData.status)}
نوع الفكرة: ${ideaData.idea_type || 'غير محدد'}

الوصف:
${ideaData.description || 'لا يوجد وصف'}

المشكلة:
${ideaData.problem || 'غير محددة'}

الفرصة:
${ideaData.opportunity || 'غير محددة'}

الفوائد المتوقعة:
${ideaData.benefits || 'غير محددة'}

الموارد المطلوبة:
${ideaData.required_resources || 'غير محددة'}

فترة التنفيذ المقترحة: ${ideaData.duration || 'غير محددة'}
تاريخ التنفيذ المقترح: ${ideaData.proposed_execution_date ? new Date(ideaData.proposed_execution_date).toLocaleDateString('ar') : 'غير محدد'}

الإدارات المساهمة:
${formatDepartments(ideaData.contributing_departments)}

الشركاء المتوقعون:
${formatPartners(ideaData.expected_partners)}

التكاليف المتوقعة:
${formatCosts(ideaData.expected_costs)}`;
};

/**
 * Generates text content for comments
 */
export const generateCommentsTextContent = (comments: any[]): string => {
  let commentsText = "المناقشات:\n\n";
  
  if (comments && comments.length > 0) {
    comments.forEach((comment, index) => {
      const commentDate = new Date(comment.created_at).toLocaleString('ar');
      commentsText += `[${commentDate}] ${comment.user_email || 'مستخدم'}: ${comment.content}\n`;
      if (comment.attachment_url) {
        commentsText += `مرفق: ${comment.attachment_name || 'ملف مرفق'}\n`;
      }
      commentsText += "------------------------------\n";
    });
  } else {
    commentsText += "لا توجد مناقشات.";
  }
  
  return commentsText;
};

/**
 * Generates text content for votes
 */
export const generateVotesTextContent = (votes: any[]): string => {
  let votesText = "التصويتات:\n\n";
  const upVotes = votes.filter(v => v.vote_type === 'up').length;
  const downVotes = votes.filter(v => v.vote_type === 'down').length;
  
  votesText += `إجمالي الأصوات: ${votes.length}\n`;
  votesText += `الأصوات المؤيدة: ${upVotes}\n`;
  votesText += `الأصوات المعارضة: ${downVotes}\n`;
  
  return votesText;
};

/**
 * Generates text content for a decision
 */
export const generateDecisionTextContent = (decision: any): string => {
  if (!decision) return "القرار: لا يوجد قرار بعد.";
  
  const decisionDate = new Date(decision.created_at).toLocaleString('ar');
  return `القرار:
تاريخ القرار: ${decisionDate}
متخذ القرار: ${decision.decision_maker?.email || 'غير معروف'}
الحالة: ${getStatusText(decision.status)}

سبب القرار / ملاحظات:
${decision.reason || 'لا توجد ملاحظات'}

${decision.status === 'approved' ? `
المكلف بالتنفيذ: ${decision.assignee || 'غير محدد'}
الإطار الزمني: ${decision.timeline || 'غير محدد'}
الميزانية المقترحة: ${decision.budget || 'غير محددة'}
` : ''}`;
};

/**
 * Generates the complete text content for an idea export
 */
export const generateTextContent = (data: any): string => {
  let content = "";
  
  // Add idea information
  content += generateIdeaTextContent(data.idea);
  
  // Add comments
  if (data.comments) {
    content += "\n\n" + "=" .repeat(50) + "\n";
    content += generateCommentsTextContent(data.comments);
  }
  
  // Add votes
  if (data.votes) {
    content += "\n\n" + "=" .repeat(50) + "\n";
    content += generateVotesTextContent(data.votes);
  }
  
  // Add decision
  if (data.decision) {
    content += "\n\n" + "=" .repeat(50) + "\n";
    content += generateDecisionTextContent(data.decision);
  }
  
  return content;
};
