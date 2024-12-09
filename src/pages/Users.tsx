import { Navigation } from "@/components/Navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore } from "@/store/authStore";
import { Navigate } from "react-router-dom";

const Users = () => {
  const { user } = useAuthStore();

  // التحقق من صلاحيات المستخدم
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // بيانات المستخدمين (يمكن ربطها لاحقاً بقاعدة البيانات)
  const users = [
    { id: "1", username: "admin", role: "مشرف", lastLogin: "2024-03-20" },
  ];

  return (
    <div dir="rtl">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">إدارة المستخدمين</h1>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المستخدم</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>آخر تسجيل دخول</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Users;