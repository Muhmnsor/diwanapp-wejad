
import { Logo } from "@/components/Logo";
import { Instagram, Linkedin, X } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-auto">
      {/* Top Section - Social Media, Website Link, and Slogan */}
      <div className="border-t border-b border-[#C8C8C9] dark:border-[#2A2F3C] py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-0 md:justify-between" dir="rtl">
            {/* Slogan - Right */}
            <p className="text-primary text-lg font-semibold text-center md:text-right">
              ديوان .. شريك الشباب
            </p>
            
            {/* Website Link - Center */}
            <a 
              href="https://www.dfy.org.sa" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              www.dfy.org.sa
            </a>
            
            {/* Social Media Icons - Left */}
            <div className="flex items-center gap-4">
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

      {/* Bottom Section - Logo and Organization Details */}
      <div className="py-8">
        <div dir="rtl" className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Organization Details - Right */}
            <div className="flex flex-col space-y-2 text-right">
              <h3 className="font-bold text-xl mb-2 text-[#403E43] dark:text-white">جمعية ديوان الشبابية</h3>
              <p className="text-[#9F9EA1]">المملكة العربية السعودية - المدينة المنورة</p>
              <p className="text-[#9F9EA1]">رقم الترخيص 5531</p>
            </div>
            
            {/* Logo - Left */}
            <div className="order-first md:order-last">
              <img 
                src="/lovable-uploads/eca67883-2474-4656-a5b3-5abaf42f015b.png" 
                alt="Diwan Logo" 
                className="w-full h-auto max-w-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* New Section - Development Credit */}
      <div className="border-t border-[#C8C8C9] dark:border-[#2A2F3C] py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center text-sm text-[#9F9EA1]" dir="rtl">
            <span>تطوير منصة وِجاد</span>
            <a 
              href="https://twitter.com/xwejad" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mr-2 text-primary hover:text-primary/80 transition-colors"
            >
              @xwejad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
