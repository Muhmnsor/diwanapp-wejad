import { Container } from "@/components/ui/container";

export const Footer = () => {
  return (
    <footer className="mt-auto py-8 border-t border-[#C8C8C9] dark:border-[#2A2F3C]" dir="rtl">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            جميع الحقوق محفوظة © {new Date().getFullYear()}
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              سياسة الخصوصية
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              شروط الاستخدام
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};