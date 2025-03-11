
// Re-export all developer-related functionality
export * from './modeManagement';
// Export roleManagement functions (except the duplicated one)
export {
  isDeveloper,
  assignDeveloperRole,
  removeDeveloperRole
} from './roleManagement';
// Export initialization functionality
export {
  initializeDeveloperRole,
  autoAssignDeveloperRole
} from './initialization';

// Initialize developer features on application start
export const initializeDeveloperFeatures = async (): Promise<void> => {
  try {
    // Initialize developer role and make sure it exists
    await initializeDeveloperRole();
    
    console.log('Developer features initialized successfully');
  } catch (error) {
    console.error('Failed to initialize developer features:', error);
  }
};
