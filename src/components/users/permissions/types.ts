
export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

export interface Module {
  name: string;
  permissions: Permission[];
  isOpen: boolean;
}
