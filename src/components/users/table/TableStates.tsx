
interface EmptyStateProps {
  hasSearchTerm: boolean;
}

export const EmptyState = ({ hasSearchTerm }: EmptyStateProps) => {
  return (
    <tr>
      <td colSpan={3} className="py-6 text-center text-muted-foreground">
        {hasSearchTerm ? "لا توجد نتائج مطابقة للبحث" : "لا يوجد مستخدمين"}
      </td>
    </tr>
  );
};
