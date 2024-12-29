import { Logo } from "@/components/Logo";
import { Instagram, Linkedin, X } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-auto py-8 border-t border-[#C8C8C9] dark:border-[#2A2F3C]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Logo */}
          <div className="order-last md:order-first">
            <img 
              src="/lovable-uploads/2f147e3a-170c-48d5-acdf-219169839b0a.png" 
              alt="Diwan Logo" 
              className="w-full h-auto max-w-xl"
            />
          </div>
          
          {/* Right Side - Content */}
          <div className="flex flex-col justify-between h-full" dir="rtl">
            {/* Text Content */}
            <div className="text-right mb-6">
              <h3 className="font-bold text-xl mb-2 text-[#403E43] dark:text-white">جمعية ديوان الشبابية</h3>
              <p className="text-[#9F9EA1] mb-1">المملكة العربية السعودية - المدينة المنورة</p>
              <p className="text-[#9F9EA1] mb-2">رقم الترخيص 5531</p>
              <p className="text-primary text-lg font-semibold">ديوان .. شريك الشباب</p>
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-between">
              <a 
                href="https://www.dfy.org.sa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                www.dfy.org.sa
              </a>
              
              <div className="flex space-x-4 rtl:space-x-reverse">
                <a href="https://twitter.com/d4ymed" target="_blank" rel="noopener noreferrer" className="text-[#9F9EA1] hover:text-primary transition-colors">
                  <X className="w-6 h-6" />
                </a>
                <a href="https://instagram.com/d4ymed" target="_blank" rel="noopener noreferrer" className="text-[#9F9EA1] hover:text-primary transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://linkedin.com/company/d4ymed" target="_blank" rel="noopener noreferrer" className="text-[#9F9EA1] hover:text-primary transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};