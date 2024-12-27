import { UsersTable } from "@/components/users/UsersTable";
import { UsersHeader } from "@/components/users/UsersHeader";
import { useUsersData } from "@/components/users/hooks/useUsersData";
import { Card, CardContent } from "@/components/ui/card";

export const UsersManagement = () => {
  const { roles, users, isLoading, refetchUsers } = useUsersData();

  if (isLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  return (
    <Card>
      <CardContent className="pt-6" dir="rtl">
        <UsersHeader roles={roles} onUserCreated={refetchUsers} />
        <UsersTable users={users} onUserDeleted={refetchUsers} />
      </CardContent>
    </Card>
  );
};