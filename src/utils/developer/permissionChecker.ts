
import { supabase } from "@/integrations/supabase/client";

/**
 * تحقق مما إذا كان المستخدم يملك صلاحية معينة
 * @param userId معرف المستخدم
 * @param permissionName اسم الصلاحية المطلوب التحقق منها
 * @returns Promise<boolean> يعيد true إذا كان المستخدم يملك الصلاحية، وfalse إذا لم يكن يملكها
 */
export const checkUserPermission = async (
  userId: string,
  permissionName: string
): Promise<boolean> => {
  try {
    if (!userId) return false;

    // Check if user is admin (admins have all permissions)
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (userProfile?.is_admin) {
      return true;
    }

    // Get the permission ID
    const { data: permission, error: permissionError } = await supabase
      .from("permissions")
      .select("id")
      .eq("name", permissionName)
      .single();

    if (permissionError || !permission) {
      console.error("Permission not found:", permissionName);
      return false;
    }

    // Get the user's roles
    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", userId);

    if (rolesError || !userRoles.length) {
      return false;
    }

    // Check if any of the user's roles have the permission
    const roleIds = userRoles.map((ur) => ur.role_id);
    const { data: rolePermissions, error: rpError } = await supabase
      .from("role_permissions")
      .select("permission_id")
      .eq("permission_id", permission.id)
      .in("role_id", roleIds);

    if (rpError) {
      return false;
    }

    return rolePermissions.length > 0;
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
};

/**
 * تحقق مما إذا كان المستخدم يملك أي من الصلاحيات المحددة
 * @param userId معرف المستخدم
 * @param permissionNames مصفوفة من أسماء الصلاحيات المطلوب التحقق منها
 * @returns Promise<boolean> يعيد true إذا كان المستخدم يملك أي من الصلاحيات، وfalse إذا لم يكن يملك أياً منها
 */
export const checkUserAnyPermission = async (
  userId: string,
  permissionNames: string[]
): Promise<boolean> => {
  if (!userId || !permissionNames.length) return false;

  // Check if user is admin (admins have all permissions)
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (userProfile?.is_admin) {
    return true;
  }

  // Get the permission IDs
  const { data: permissions, error: permissionsError } = await supabase
    .from("permissions")
    .select("id")
    .in("name", permissionNames);

  if (permissionsError || !permissions.length) {
    return false;
  }

  // Get the user's roles
  const { data: userRoles, error: rolesError } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", userId);

  if (rolesError || !userRoles.length) {
    return false;
  }

  // Check if any of the user's roles have any of the permissions
  const roleIds = userRoles.map((ur) => ur.role_id);
  const permissionIds = permissions.map((p) => p.id);

  const { data: rolePermissions, error: rpError } = await supabase
    .from("role_permissions")
    .select("permission_id")
    .in("permission_id", permissionIds)
    .in("role_id", roleIds);

  if (rpError) {
    return false;
  }

  return rolePermissions.length > 0;
};

/**
 * تحقق مما إذا كان المستخدم يملك جميع الصلاحيات المحددة
 * @param userId معرف المستخدم
 * @param permissionNames مصفوفة من أسماء الصلاحيات المطلوب التحقق منها
 * @returns Promise<boolean> يعيد true إذا كان المستخدم يملك جميع الصلاحيات، وfalse إذا لم يكن يملك جميعها
 */
export const checkUserAllPermissions = async (
  userId: string,
  permissionNames: string[]
): Promise<boolean> => {
  if (!userId || !permissionNames.length) return false;

  // Check if user is admin (admins have all permissions)
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (userProfile?.is_admin) {
    return true;
  }

  // Check each permission individually
  const results = await Promise.all(
    permissionNames.map((name) => checkUserPermission(userId, name))
  );

  // Return true only if all checks passed
  return results.every((result) => result === true);
};

/**
 * تحقق مما إذا كان المستخدم يملك صلاحية عملية معينة في وحدة معينة
 * @param userId معرف المستخدم
 * @param module اسم الوحدة (مثل documents, events, الخ)
 * @param action اسم العملية (مثل view, create, edit, الخ)
 * @returns Promise<boolean> يعيد true إذا كان المستخدم يملك الصلاحية، وfalse إذا لم يكن يملكها
 */
export const checkModuleAction = async (
  userId: string,
  module: string,
  action: string
): Promise<boolean> => {
  const permissionName = `${module}_${action}`;
  return checkUserPermission(userId, permissionName);
};
