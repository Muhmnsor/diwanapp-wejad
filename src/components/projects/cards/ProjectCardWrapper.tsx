import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface ProjectCardWrapperProps {
  children: ReactNode;
  className?: string;
}

export const ProjectCardWrapper = ({ children, className = "" }: ProjectCardWrapperProps) => {
  return (
    <div className={`w-[380px] sm:w-[460px] lg:w-[480px] mx-auto relative ${className}`} dir="rtl">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in h-full">
        {children}
      </Card>
    </div>
  );
};