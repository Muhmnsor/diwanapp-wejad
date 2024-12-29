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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <TopHeader />
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div>
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
              تسجيل الدخول
            </h1>
            <p className="text-center text-gray-600 text-sm">
              قم بتسجيل الدخول للوصول إلى حسابك
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                placeholder="أدخل بريدك الإلكتروني"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
                placeholder="أدخل كلمة المرور"
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;