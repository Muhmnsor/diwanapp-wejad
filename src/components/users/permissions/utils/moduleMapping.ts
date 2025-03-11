
export const moduleDisplayNames: Record<string, string> = {
  events: 'الفعاليات',
  documents: 'المستندات',
  tasks: 'المهام',
  finance: 'المالية',
  ideas: 'الأفكار',
  requests: 'الطلبات',
  system: 'النظام',
  admin: 'الإدارة',
  users: 'المستخدمين',
  developer: 'المطور',
  settings: 'الإعدادات',
  // Add other modules as needed
};

export const getModuleDisplayName = (moduleName: string): string => {
  return moduleDisplayNames[moduleName] || moduleName;
};
