import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login: Starting login process with email:", email);
    
    try {
      console.log("Login: Attempting to login...");
      await login(email, password);
      console.log("Login: Login successful");
      toast.success("تم تسجيل الدخول بنجاح");
      
      // Get the redirect path from location state, or default to "/"
      const from = (location.state as any)?.from || "/";
      console.log("Login: Redirecting to:", from);
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login: Error during login:", error);
      toast.error("خطأ في تسجيل الدخول، يرجى التحقق من البريد الإلكتروني وكلمة المرور");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-8">تسجيل الدخول</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              تسجيل الدخول
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;