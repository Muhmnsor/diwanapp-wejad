
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserCircle, Search, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { checkDeveloperPermissions } from '@/components/users/permissions/utils/developerPermissionUtils';
import { RoleManagement } from '@/components/users/RoleManagement';
import { DeveloperPermissionChecks } from '@/components/users/permissions/types';

export const UsersManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<Array<{id: string, email: string, username?: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userPermissions, setUserPermissions] = useState<DeveloperPermissionChecks | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserPermissions(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      
      setUsers(data.users.map(user => ({
        id: user.id,
        email: user.email || '',
        username: user.user_metadata?.username || user.email
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPermissions = async (userId: string) => {
    try {
      const permissions = await checkDeveloperPermissions(userId);
      setUserPermissions(permissions);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handlePermissionsUpdate = (updatedPermissions: DeveloperPermissionChecks) => {
    setUserPermissions(updatedPermissions);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>المستخدمين</CardTitle>
            <CardDescription>اختر مستخدم لإدارة صلاحياته</CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن مستخدم..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <p className="text-center py-4 text-muted-foreground">جارٍ التحميل...</p>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <Button
                    key={user.id}
                    variant={selectedUserId === user.id ? "default" : "outline"}
                    className="w-full justify-start gap-2"
                    onClick={() => handleUserSelect(user.id)}
                  >
                    <UserCircle className="h-4 w-4" />
                    <span className="truncate">{user.username || user.email}</span>
                  </Button>
                ))
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد مستخدمين'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        {selectedUserId && userPermissions ? (
          <RoleManagement 
            userId={selectedUserId} 
            initialPermissions={userPermissions}
            onPermissionsUpdate={handlePermissionsUpdate}
          />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                يرجى اختيار مستخدم من القائمة لإدارة صلاحياته
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
