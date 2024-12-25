import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    console.log("Login - Checking authentication state:", isAuthenticated);
    if (isAuthenticated) {
      const from = location.state?.from || "/";
      console.log("Login - User is authenticated, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log("Login - Attempting login");
    try {
      await login(data.email, data.password);
      const from = location.state?.from || "/";
      console.log("Login - Login successful, redirecting to:", from);
      navigate(from, { replace: true });
      toast.success('تم تسجيل الدخول بنجاح');
    } catch (error) {
      console.error('Login - Login error:', error);
      toast.error('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى');
    }
  };

  return (
    <div dir="rtl">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-md">
        <h1 className="text-3xl font-bold mb-8">تسجيل الدخول</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="أدخل البريد الإلكتروني" 
                      type="email" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>كلمة المرور</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="أدخل كلمة المرور" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              تسجيل الدخول
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Login;