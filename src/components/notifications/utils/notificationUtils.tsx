
import React from 'react';
import { Bell, Calendar, FileText, Users, MessageSquare, Tag, AlertCircle } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { ar } from 'date-fns/locale';

export const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'event':
      return <Calendar className="h-4 w-4" />;
    case 'project':
      return <FileText className="h-4 w-4" />;
    case 'task':
      return <Tag className="h-4 w-4" />;
    case 'user':
      return <Users className="h-4 w-4" />;
    case 'comment':
      return <MessageSquare className="h-4 w-4" />;
    case 'system':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

export const formatNotificationDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return formatDistance(date, new Date(), {
      addSuffix: true,
      locale: ar
    });
  } catch (error) {
    return 'وقت غير معروف';
  }
};
