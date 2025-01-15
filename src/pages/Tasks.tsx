import { PortfolioHeader } from "@/components/portfolio/components/PortfolioHeader";
import { PortfolioList } from "@/components/portfolio/PortfolioList";

export default function Tasks() {
  return (
    <main className="flex-1 container mx-auto px-4 py-8" dir="rtl">
      <PortfolioHeader />
      <PortfolioList />
    </main>
  );
}