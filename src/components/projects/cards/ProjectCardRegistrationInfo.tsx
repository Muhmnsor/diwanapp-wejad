import { useRegistrations } from "@/hooks/useRegistrations";
import { useAuthStore } from "@/store/authStore";
import { getRegistrationStatus } from "../utils/registrationStatus";

interface ProjectCardRegistrationInfoProps {
  id: string;
  startDate: string;
  endDate: string;
  registrationStartDate?: string | null;
  registrationEndDate?: string | null;
  maxAttendees: number;
}

export const ProjectCardRegistrationInfo = ({
  id,
  startDate,
  endDate,
  registrationStartDate,
  registrationEndDate,
  maxAttendees,
}: ProjectCardRegistrationInfoProps) => {
  const { isAuthenticated } = useAuthStore();
  const { data: registrations = {} } = useRegistrations();
  
  const isRegistered = isAuthenticated && registrations[id];

  // Type guard to ensure registration has project_id
  const isValidRegistration = (reg: any): reg is { project_id: string } => {
    return reg !== null && 
           typeof reg === 'object' && 
           'project_id' in reg && 
           typeof reg.project_id === 'string' &&
           reg.project_id === id;
  };
  
  const currentRegistrations = Object.values(registrations)
    .filter(isValidRegistration)
    .length;
  
  const registrationStatus = getRegistrationStatus(
    startDate,
    endDate,
    registrationStartDate,
    registrationEndDate,
    maxAttendees,
    currentRegistrations,
    Boolean(isRegistered)
  );

  return { registrationStatus, isRegistered };
};