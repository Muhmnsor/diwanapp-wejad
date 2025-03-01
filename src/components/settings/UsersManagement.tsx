
import { useState } from "react";
import { UsersTable } from "@/components/users/UsersTable";
import { UsersHeader } from "@/components/users/UsersHeader";
import { useUsersData } from "@/components/users/hooks/useUsersData";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@/components/users/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const UsersManagement = () => {
  const { roles, users, isLoading, refetchUsers } = useUsersData();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    if (!searchTerm.trim()) return true;
    return (
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (isLoading) {
    return <div className="text-center p-8">جاري التحميل...</div>;
  }

  return (
    <Card>
      <CardContent className="pt-6" dir="rtl">
        <UsersHeader 
          roles={roles} 
          users={filteredUsers} 
          onUserCreated={refetchUsers} 
        />
        
        <div className="relative w-full max-w-sm mb-6">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث عن المستخدمين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 w-full"
          />
        </div>

        <UsersTable 
          users={filteredUsers} 
          onUserDeleted={refetchUsers} 
        />
      </CardContent>
    </Card>
  );
};
