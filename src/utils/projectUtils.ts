interface ProjectStatusParams {
  startDate: string;
  endDate: string;
  maxAttendees: number;
  registrationStartDate?: string | null;
  registrationEndDate?: string | null;
  beneficiaryType: string;
  attendees: number;
}

export const getProjectStatus = ({
  startDate,
  endDate,
  maxAttendees,
  registrationStartDate,
  registrationEndDate,
  beneficiaryType,
  attendees,
}: ProjectStatusParams) => {
  const now = new Date();
  const projectStartDate = new Date(startDate);
  const projectEndDate = new Date(endDate);
  
  // Check if project has ended
  if (projectEndDate < now) {
    return {
      text: "انتهى المشروع",
      variant: "destructive" as const,
      color: "bg-destructive",
      textColor: "text-destructive-foreground"
    };
  }

  // Check if project is full
  if (maxAttendees > 0 && attendees >= maxAttendees) {
    return {
      text: "اكتمل العدد",
      variant: "destructive" as const,
      color: "bg-destructive",
      textColor: "text-destructive-foreground"
    };
  }

  // Check registration period
  if (registrationStartDate && registrationEndDate) {
    const regStartDate = new Date(registrationStartDate);
    const regEndDate = new Date(registrationEndDate);

    if (now < regStartDate) {
      return {
        text: "لم يبدأ التسجيل",
        variant: "secondary" as const,
        color: "bg-secondary",
        textColor: "text-secondary-foreground"
      };
    }

    if (now > regEndDate) {
      return {
        text: "انتهى التسجيل",
        variant: "destructive" as const,
        color: "bg-destructive",
        textColor: "text-destructive-foreground"
      };
    }
  }

  // Project is active and registration is open
  return {
    text: "التسجيل متاح",
    variant: "secondary" as const,
    color: "bg-secondary",
    textColor: "text-secondary-foreground"
  };
};