import { Clock, UserCheck, UserX, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface RegistrationStatus {
  status: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

export const getRegistrationStatus = (
  startDate: string,
  endDate: string,
  registrationStartDate: string | null | undefined,
  registrationEndDate: string | null | undefined,
  maxAttendees: number = 0,
  currentRegistrations: number = 0,
  isRegistered: boolean = false
): RegistrationStatus => {
  const now = new Date();
  const projectEndDate = new Date(endDate);
  const projectStartDate = new Date(startDate);
  
  const regStartDate = registrationStartDate ? new Date(registrationStartDate) : null;
  const regEndDate = registrationEndDate ? new Date(registrationEndDate) : null;

  if (now > projectEndDate) {
    return {
      status: 'ended',
      label: 'انتهى المشروع',
      icon: XCircle,
      color: 'bg-gray-500'
    };
  }

  if (isRegistered) {
    return {
      status: 'registered',
      label: 'مسجل',
      icon: CheckCircle,
      color: 'bg-green-500'
    };
  }

  if (maxAttendees > 0 && currentRegistrations >= maxAttendees) {
    return {
      status: 'full',
      label: 'اكتمل العدد',
      icon: AlertCircle,
      color: 'bg-yellow-500'
    };
  }

  if (regStartDate && now < regStartDate) {
    return {
      status: 'notStarted',
      label: 'لم يبدأ التسجيل',
      icon: Clock,
      color: 'bg-blue-500'
    };
  }

  if (regEndDate && now > regEndDate) {
    return {
      status: 'registrationEnded',
      label: 'انتهى التسجيل',
      icon: XCircle,
      color: 'bg-red-500'
    };
  }

  if (now >= projectStartDate) {
    return {
      status: 'started',
      label: 'بدأ المشروع',
      icon: AlertCircle,
      color: 'bg-orange-500'
    };
  }

  return {
    status: 'available',
    label: 'التسجيل متاح',
    icon: CheckCircle,
    color: 'bg-green-500'
  };
};