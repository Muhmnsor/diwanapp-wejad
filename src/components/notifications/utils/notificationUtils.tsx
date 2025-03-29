
import React from 'react';
import { Bell, Calendar, FileText, PieChart, Users, MessageCircle, Banknote } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { NotificationType } from '@/contexts/notifications/types';

export const getNotificationIcon = (notificationType: string) => {
  switch (notificationType) {
    case 'event':
      return <Calendar className="h-5 w-5 text-blue-500" />;
    case 'project':
      return <PieChart className="h-5 w-5 text-green-500" />;
    case 'task':
      return <FileText className="h-5 w-5 text-orange-500" />;
    case 'user':
      return <Users className="h-5 w-5 text-purple-500" />;
    case 'comment':
      return <MessageCircle className="h-5 w-5 text-pink-500" />;
    case 'finance':
      return <Banknote className="h-5 w-5 text-emerald-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

export const formatNotificationDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd MMM yyyy، HH:mm', { locale: ar });
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return dateString; // Return original string if formatting fails
  }
};
