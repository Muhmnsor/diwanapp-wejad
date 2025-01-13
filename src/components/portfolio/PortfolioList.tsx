import { usePortfolioSync } from './hooks/usePortfolioSync';
import { PortfolioHeader } from './components/PortfolioHeader';
import { PortfolioGrid } from './components/PortfolioGrid';

export const PortfolioList = () => {
  const { portfolios, isLoading, error, handleSync } = usePortfolioSync();

  if (error) {
    console.error('Query error:', error);
    return <div className="p-4 text-red-500">حدث خطأ أثناء تحميل المحافظ</div>;
  }

  if (isLoading) {
    return <div className="p-4">جاري التحميل...</div>;
  }

  if (!portfolios?.length) {
    return <div className="p-4">لم يتم العثور على محافظ</div>;
  }

  return (
    <div className="space-y-4" dir="rtl">
      <PortfolioHeader onSync={handleSync} />
      <PortfolioGrid portfolios={portfolios} />
    </div>
  );
};