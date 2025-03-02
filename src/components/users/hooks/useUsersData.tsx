
import { useRolesData } from "./useRolesData";
import { useUsersRolesData } from "./useUsersRolesData";

export const useUsersData = () => {
  const { roles, isLoading: rolesLoading } = useRolesData();
  const { users, isLoading: usersLoading, refetchUsers } = useUsersRolesData();

  return {
    roles,
    users,
    isLoading: rolesLoading || usersLoading,
    refetchUsers
  };
};
