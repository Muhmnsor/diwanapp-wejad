import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export const Hero = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center space-y-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary">
            منصة إدارة الفعاليات والمشاريع
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            نظام متكامل لإدارة الفعاليات والمشاريع، يتيح لك إنشاء وإدارة الفعاليات والمشاريع بكل سهولة
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!isAuthenticated && (
              <Button 
                onClick={() => navigate("/login")}
                size="lg"
                className="w-full sm:w-auto min-w-[200px] text-lg"
              >
                تسجيل الدخول
              </Button>
            )}
            <Button 
              onClick={() => navigate("/events")}
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto min-w-[200px] text-lg"
            >
              استعراض الفعاليات
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};