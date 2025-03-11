
// Export individual functions from separate modules
import { initializeDeveloperRole, autoAssignDeveloperRole } from './developer/initialization';
import { isDeveloper, assignDeveloperRole, removeDeveloperRole } from './developer/roleManagement';
import { isDeveloperModeEnabled, toggleDeveloperMode } from './developer/modeManagement';

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

// Initialize developer features on application start - this is now decoupled from the imports
export const initializeDeveloperFeatures = async (): Promise<void> => {
  try {
    // Get the already-imported function (no circular dependency)
    await initializeDeveloperRole();
    console.log('Developer features initialized successfully');
  } catch (error) {
    console.error('Failed to initialize developer features:', error);
  }
};
