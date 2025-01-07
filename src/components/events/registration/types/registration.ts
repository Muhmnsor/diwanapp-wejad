export interface RegistrationFormData {
  name?: string;
  arabicName: string;
  englishName?: string;
  email: string;
  phone: string;
  educationLevel?: string;
  birthDate?: string | null;
  nationalId?: string;
  gender?: string;
  workStatus?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

export interface UseRegistrationProps {
  eventId?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}