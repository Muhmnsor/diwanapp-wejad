
import { initializeDeveloperRole, autoAssignDeveloperRole } from './developer/initialization';
import { isDeveloper } from './developer/roleManagement';
import { isDeveloperModeEnabled, toggleDeveloperMode } from './developer/modeManagement';
import { assignDeveloperRole, removeDeveloperRole } from './developer/roleManagement';

// Export everything from the new structure
export {
  initializeDeveloperRole,
  autoAssignDeveloperRole,
  isDeveloper,
  assignDeveloperRole,
  removeDeveloperRole,
  isDeveloperModeEnabled,
  toggleDeveloperMode
};

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
