import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <div className="text-center py-12 md:py-24 px-4">
      <h1 className="text-4xl md:text-6xl font-bold text-[#1A1F2C] mb-6">
        جمعية ديوان الشبابية
      </h1>
      <p className="text-lg md:text-xl text-[#6B7280] mb-8 max-w-2xl mx-auto">
        نسعى لتمكين الشباب وتطوير مهاراتهم من خلال برامج وفعاليات متنوعة
      </p>
      <Link to="/create">
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          إنشاء فعالية
        </Button>
      </Link>
    </div>
  );
};