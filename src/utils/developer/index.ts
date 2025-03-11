
// Export directly from the modules to avoid duplicate export issues
export * from './modeManagement';
export { 
  isDeveloper,
  assignDeveloperRole,
  removeDeveloperRole
} from './roleManagement';

// Re-export from initialization but avoid duplicating initializeDeveloperRole
export { autoAssignDeveloperRole } from './initialization';

// Re-export initializeDeveloperRole with an explicit choice of which implementation to use
// We're choosing to export the implementation from roleManagement.ts as the canonical one
export { initializeDeveloperRole } from './roleManagement';
