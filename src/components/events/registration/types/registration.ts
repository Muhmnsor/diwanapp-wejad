export interface RegistrationFormData {
  arabicName: string;
  email: string;
  phone: string;
  englishName?: string;
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
  onSuccess?: () => void;
  isProject?: boolean;
}

export interface UseRegistrationReturn {
  formData: RegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>;
  isSubmitting: boolean;
  registrationNumber: string;
  isRegistered: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  submitRegistration: (data: RegistrationFormData) => Promise<void>;
}