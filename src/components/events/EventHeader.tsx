interface EventHeaderProps {
  title: string;
  logoUrl: string;
}

export const EventHeader = ({ title, logoUrl }: EventHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      <img
        src={logoUrl}
        alt="Logo"
        className="w-16 h-16"
      />
    </div>
  );
};