
import { Logo } from "./header/Logo";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-[#F9F9FA] dark:bg-[#1A1F2C] mt-auto" dir="rtl">
      <div className="border-t border-b border-[#C8C8C9] dark:border-[#2A2F3C] py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
            <div className="w-24 md:w-32">
              <img
                src="/lovable-uploads/cdbe8500-c605-4cde-9981-0ed24e21991c.png"
                alt="ديوان"
                className="w-full h-auto"
              />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8 text-sm">
              <Link to="/" className="text-[#4A4E57] dark:text-[#9DA3AE] hover:text-primary">
                الرئيسية
              </Link>
              <Link to="/events" className="text-[#4A4E57] dark:text-[#9DA3AE] hover:text-primary">
                الفعاليات
              </Link>
              <Link to="/projects" className="text-[#4A4E57] dark:text-[#9DA3AE] hover:text-primary">
                المشاريع
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-4">
        <p className="text-xs text-center text-[#4A4E57] dark:text-[#9DA3AE]">
          جميع الحقوق محفوظة © 2024
        </p>
      </div>
    </footer>
  );
};
