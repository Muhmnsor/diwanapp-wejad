
import { ROLE_MAPPING, APP_ROLE_ACCESS } from "@/components/admin/dashboard/getAppsList";

/**
 * Check if a role exists in the role mapping and get its standardized English equivalent
 * @param roleName The role name to check (in Arabic or English)
 * @returns Information about the role mapping
 */
export const debugRoleMapping = (roleName: string) => {
  if (!roleName) {
    return { 
      exists: false, 
      mappedRole: null,
      message: "No role name provided"
    };
  }
  
  // Try direct mapping
  const directMapping = ROLE_MAPPING[roleName as keyof typeof ROLE_MAPPING];
  if (directMapping) {
    return {
      exists: true,
      mappedRole: directMapping,
      message: `Direct mapping found: "${roleName}" → "${directMapping}"`
    };
  }
  
  // Try with underscores
  const withUnderscores = roleName.trim().replace(/\s+/g, '_').toLowerCase();
  const underscoreMapping = ROLE_MAPPING[withUnderscores as keyof typeof ROLE_MAPPING];
  if (underscoreMapping) {
    return {
      exists: true,
      mappedRole: underscoreMapping,
      message: `Mapping found with underscores: "${roleName}" (as "${withUnderscores}") → "${underscoreMapping}"`
    };
  }
  
  // Check if it exists as a value (English role name)
  const roleValues = Object.values(ROLE_MAPPING);
  if (roleValues.includes(roleName)) {
    return {
      exists: true,
      mappedRole: roleName,
      message: `Role exists directly as an English role name: "${roleName}"`
    };
  }
  
  // No mapping found
  return {
    exists: false,
    mappedRole: null,
    message: `No mapping found for role name: "${roleName}"`
  };
};

/**
 * Get all possible roles for an application
 * @param appKey The application key (e.g., 'events', 'documents')
 * @returns List of roles that can access the app and their Arabic equivalents
 */
export const debugAppRoles = (appKey: string) => {
  try {
    const allowedRoles = APP_ROLE_ACCESS[appKey as keyof typeof APP_ROLE_ACCESS] || [];
    
    // Create a reverse mapping (English to Arabic)
    const reverseMapping: Record<string, string[]> = {};
    
    Object.entries(ROLE_MAPPING).forEach(([arabic, english]) => {
      if (!reverseMapping[english]) {
        reverseMapping[english] = [];
      }
      reverseMapping[english].push(arabic);
    });
    
    // Get Arabic equivalents for each allowed role
    const rolesWithArabicNames = allowedRoles.map(role => ({
      englishName: role,
      arabicNames: reverseMapping[role] || []
    }));
    
    return {
      appKey,
      allowedRolesCount: allowedRoles.length,
      allowedRoles: rolesWithArabicNames
    };
  } catch (error) {
    console.error('Error in debugAppRoles:', error);
    return {
      appKey,
      allowedRolesCount: 0,
      allowedRoles: [],
      error: 'Failed to load role data'
    };
  }
};
