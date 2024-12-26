interface ReportListHeaderProps {
  title: string;
}

export const ReportListHeader = ({ title }: ReportListHeaderProps) => {
  return (
    <h3 className="text-lg font-semibold">{title}</h3>
  );
};