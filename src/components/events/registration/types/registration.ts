export interface RegistrationFormData {
  name: string;
  email: string;
  phone: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  arabicName: string;
  englishName?: string;
  educationLevel?: string;
  birthDate?: string | null;  // Making it nullable to handle empty values
  nationalId?: string;
  gender?: string;
  workStatus?: string;
}