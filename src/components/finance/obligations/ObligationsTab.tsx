
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ObligationsTable } from "./ObligationsTable";
import { useObligationsData } from "./hooks/useObligationsData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ObligationBalancesTable } from "./ObligationBalancesTable";
import { useObligationBalances } from "./hooks/useObligationBalances";
import { Dialog } from "@/components/ui/dialog";
import { ObligationExpenseForm } from "./ObligationExpenseForm";
import { ObligationDetailsDialog } from "./ObligationDetailsDialog";

export const ObligationsTab = () => {
  const { obligations, loading, totalAmount } = useObligationsData();
  const { 
    balances, 
    loading: loadingBalances, 
    totalOriginal, 
    totalSpent, 
    totalRemaining,
    refetch: refetchBalances 
  } = useObligationBalances();
  
  const [activeTab, setActiveTab] = useState("summary");
  
  // States for dialogs
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [selectedObligation, setSelectedObligation] = useState<{
    id: string;
    amount: number;
    description: string;
    remainingBalance: number;
  } | null>(null);
  
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsObligation, setDetailsObligation] = useState<{
    id: string;
    description: string;
  } | null>(null);

  // Handle adding an expense
  const handleAddExpense = (obligationId: string, originalAmount: number, description: string) => {
    // Find the balance to get the remaining amount
    const balance = balances.find(b => b.obligation_id === obligationId);
    if (!balance) return;
    
    setSelectedObligation({
      id: obligationId,
      amount: originalAmount,
      description,
      remainingBalance: balance.remaining_balance
    });
    setAddExpenseDialogOpen(true);
  };
  
  // Handle viewing details
  const handleViewDetails = (obligationId: string, description: string) => {
    setDetailsObligation({
      id: obligationId,
      description
    });
    setDetailsDialogOpen(true);
  };
  
  // Handle success of adding an expense
  const handleExpenseAdded = async () => {
    await refetchBalances();
  };
  
  // Handle opening add expense dialog from details dialog
  const handleAddExpenseFromDetails = () => {
    if (detailsObligation && selectedObligation) {
      // Close details dialog and open add expense dialog
      setDetailsDialogOpen(false);
      setAddExpenseDialogOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">الالتزامات المالية</h2>
        <div className="bg-primary/10 text-primary font-semibold p-2 rounded-md">
          إجمالي الالتزامات: {totalAmount.toLocaleString()} ريال
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-lg">إجمالي الالتزامات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-center">
              {totalOriginal.toLocaleString()} ريال
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-lg">إجمالي المصروف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-center">
              {totalSpent.toLocaleString()} ريال
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-lg">الرصيد المتبقي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-center">
              {totalRemaining.toLocaleString()} ريال
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-right">إدارة الالتزامات</CardTitle>
          <CardDescription className="text-right">تتبع الالتزامات المالية على الموارد ومصروفاتها</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="summary" 
            value={activeTab} 
            onValueChange={setActiveTab}
            dir="rtl"
          >
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="summary">ملخص الالتزامات</TabsTrigger>
              <TabsTrigger value="balances">أرصدة الالتزامات</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <ObligationsTable obligations={obligations} loading={loading} />
            </TabsContent>
            
            <TabsContent value="balances">
              <ObligationBalancesTable 
                balances={balances} 
                loading={loadingBalances} 
                onAddExpense={handleAddExpense}
                onViewDetails={handleViewDetails}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Add Expense Dialog */}
      <Dialog open={addExpenseDialogOpen} onOpenChange={setAddExpenseDialogOpen}>
        {selectedObligation && (
          <ObligationExpenseForm
            obligationId={selectedObligation.id}
            originalAmount={selectedObligation.amount}
            description={selectedObligation.description}
            remainingBalance={selectedObligation.remainingBalance}
            onClose={() => setAddExpenseDialogOpen(false)}
            onSuccess={handleExpenseAdded}
          />
        )}
      </Dialog>
      
      {/* Details Dialog */}
      {detailsObligation && (
        <ObligationDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          obligationId={detailsObligation.id}
          obligationDescription={detailsObligation.description}
          onAddExpense={() => {
            // Find the balance to get the remaining amount
            const balance = balances.find(b => b.obligation_id === detailsObligation.id);
            if (!balance) return;
            
            setSelectedObligation({
              id: detailsObligation.id,
              amount: balance.original_amount,
              description: detailsObligation.description,
              remainingBalance: balance.remaining_balance
            });
            
            handleAddExpenseFromDetails();
          }}
        />
      )}
    </div>
  );
};
