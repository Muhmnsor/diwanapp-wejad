
import { AccountingOverview } from "./AccountingOverview";
import { FinancialAlerts } from "./dashboard/FinancialAlerts";

export const AccountingDashboard = () => {
  return (
    <div className="space-y-6">
      <FinancialAlerts />
      <AccountingOverview />
    </div>
  );
};
