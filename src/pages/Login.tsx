import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth/authStore";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    
    try {
      console.log("Login: Attempting to login with email:", email);
      await login(email, password);
      
      toast.success("تم تسجيل الدخول بنجاح");
      // Change default redirect to /apps instead of /dashboard
      const from = (location.state as any)?.from || "/apps";
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-secondary/50 to-background" dir="rtl">
      <TopHeader />
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md mx-auto shadow-lg animate-fade-in">
          <CardHeader className="space-y-2 text-center">
            <div className="flex items-center justify-center mb-4">
              <LogIn className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="text-right"
                  placeholder="أدخل بريدك الإلكتروني"
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
                  disabled={isLoading}
                  className="text-right"
                  placeholder="أدخل كلمة المرور"
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
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Login;