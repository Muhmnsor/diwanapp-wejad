/**
 * Mapping between Arabic role names and their standardized English equivalents
 * This allows the system to handle roles consistently regardless of language
 */
export const ROLE_MAPPING: Record<string, string> = {
  // Admin roles
  'مدير': 'admin',
  'مدير_النظام': 'admin',
  'مسؤول': 'admin',
  'مسؤول_النظام': 'admin',
  'admin': 'admin',
  
  // Moderator roles
  'مشرف': 'moderator',
  'مشرف_المحتوى': 'moderator',
  'moderator': 'moderator',
  
  // Regular user roles
  'مستخدم': 'user',
  'مستخدم_عادي': 'user',
  'user': 'user',
  
  // Developer roles
  'مطور': 'developer',
  'مبرمج': 'developer',
  'developer': 'developer',
  
  // HR roles
  'موارد_بشرية': 'hr_manager',
  'مدير_موارد_بشرية': 'hr_manager',
  'hr_manager': 'hr_manager',
  
  // Finance roles
  'محاسب': 'accountant',
  'مالية': 'finance_manager',
  'مدير_مالي': 'finance_manager',
  'accountant': 'accountant',
  'finance_manager': 'finance_manager',
  
  // App-specific roles
  'مدير_محتوى': 'content_manager',
  'content_manager': 'content_manager',
  'مدير_مشاريع': 'project_manager', 
  'project_manager': 'project_manager',
  'مسؤول_تطبيق': 'app_admin',
  'app_admin': 'app_admin'
};

/**
 * Map defining which roles have access to each application
 * This centralized configuration controls app access throughout the system
 */
export const APP_ROLE_ACCESS: Record<string, string[]> = {
  // Core applications
  'dashboard': ['admin', 'app_admin', 'developer'],
  'documents': ['admin', 'app_admin', 'content_manager', 'hr_manager', 'finance_manager', 'project_manager'],
  'tasks': ['admin', 'app_admin', 'project_manager', 'hr_manager', 'developer'],
  
  // Department applications
  'hr': ['admin', 'app_admin', 'hr_manager'],
  'accounting': ['admin', 'app_admin', 'finance_manager', 'accountant'],
  'finance': ['admin', 'app_admin', 'finance_manager', 'accountant'],
  
  // Content applications
  'website': ['admin', 'app_admin', 'content_manager'],
  'store': ['admin', 'app_admin', 'content_manager'],
  
  // Project applications
  'ideas': ['admin', 'app_admin', 'project_manager', 'content_manager'],
  'events': ['admin', 'app_admin', 'content_manager', 'project_manager'],
  'projects': ['admin', 'app_admin', 'project_manager'],
  
  // System applications
  'users': ['admin', 'app_admin'],
  'notifications': ['admin', 'app_admin'],
  'requests': ['admin', 'app_admin', 'hr_manager'],
  'developer': ['developer', 'admin'],
  
  // Other applications
  'internal_mail': ['admin', 'app_admin', 'hr_manager', 'finance_manager', 'content_manager', 'project_manager']
};
