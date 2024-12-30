import { Logo } from "@/components/Logo";
import { Instagram, Linkedin, X } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-auto py-8 border-t border-[#C8C8C9] dark:border-[#2A2F3C]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Right Side - Logo and Content */}
          <div className="order-first md:order-first flex flex-col items-end justify-between">
            <div className="text-right">
              <h3 className="font-bold text-xl mb-2 text-[#403E43] dark:text-white">جمعية ديوان الشبابية</h3>
              <p className="text-[#9F9EA1] mb-1">المملكة العربية السعودية - المدينة المنورة</p>
              <p className="text-[#9F9EA1] mb-2">رقم الترخيص 5531</p>
              <p className="text-primary text-lg font-semibold">ديوان .. شريك الشباب</p>
            </div>
          </div>
          
          {/* Left Side - Social Links and Logo */}
          <div className="order-last md:order-last flex flex-col items-center justify-between">
            <img 
              src="/lovable-uploads/eca67883-2474-4656-a5b3-5abaf42f015b.png" 
              alt="Diwan Logo" 
              className="w-full h-auto max-w-xl mb-1"
            />
            
            {/* Social Links */}
            <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse w-full">
              <a href="https://twitter.com/d4ymed" target="_blank" rel="noopener noreferrer" className="text-[#9F9EA1] hover:text-primary transition-colors">
                <X className="w-6 h-6" />
              </a>
              <a href="https://instagram.com/d4ymed" target="_blank" rel="noopener noreferrer" className="text-[#9F9EA1] hover:text-primary transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://linkedin.com/company/d4ymed" target="_blank" rel="noopener noreferrer" className="text-[#9F9EA1] hover:text-primary transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
              <a 
                href="https://www.dfy.org.sa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors mr-2"
              >
                www.dfy.org.sa
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};