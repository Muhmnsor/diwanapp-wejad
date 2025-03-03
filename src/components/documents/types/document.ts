
export interface Document {
  id: string;
  name: string;
  type: string;
  expiry_date: string;
  status: string;
  issuer: string;
  file_path?: string;
}

export const documentTypes = [
  "ترخيص",
  "شهادة",
  "تصريح",
  "اعتماد",
  "خطاب",
  "عقد",
  "اتفاقية",
  "سجل",
  "وثيقة",
  "تقرير",
  "بيان",
  "مذكرة",
  "أخرى"
];
