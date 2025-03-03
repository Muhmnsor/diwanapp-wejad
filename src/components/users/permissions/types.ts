
export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  application_id?: string;
}

export interface Module {
  name: string;
  permissions: Permission[];
  isOpen: boolean;
}

// إضافة واجهة التطبيق
export interface Application {
  id: string;
  name: string;
  code: string;
  description?: string;
}
