import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { PortfolioList } from "@/components/portfolio/PortfolioList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AddPortfolioDialog } from "@/components/portfolio/AddPortfolioDialog";

const Tasks = () => {
  const [isAddPortfolioDialogOpen, setIsAddPortfolioDialogOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">المحافظ</h1>
          <Button 
            onClick={() => setIsAddPortfolioDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            إضافة محفظة
          </Button>
        </div>

        <PortfolioList />

        <AddPortfolioDialog
          open={isAddPortfolioDialogOpen}
          onOpenChange={setIsAddPortfolioDialogOpen}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Tasks;