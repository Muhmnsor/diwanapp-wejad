
import { useDependencyContext } from "./DependencyContext";

export const PermissionWarning = () => {
  const { canManageDependencies } = useDependencyContext();
  
  if (canManageDependencies) return null;
  
  return (
    <div className="text-amber-500 text-sm p-2 bg-amber-50 rounded border border-amber-200">
      لا تملك صلاحية إدارة اعتماديات المهام. فقط المشرف على النظام أو مدير المشروع يمكنه ذلك.
    </div>
  );
};
