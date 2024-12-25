import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LinksSectionProps {
  title: string;
  placeholder: string;
  links: string[];
  currentLink: string;
  onLinkChange: (value: string) => void;
  onAddLink: () => void;
}

export const LinksSection = ({
  title,
  placeholder,
  links,
  currentLink,
  onLinkChange,
  onAddLink,
}: LinksSectionProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{title}</label>
      <div className="flex gap-2">
        <Input
          value={currentLink}
          onChange={(e) => onLinkChange(e.target.value)}
          placeholder={placeholder}
        />
        <Button type="button" onClick={onAddLink}>
          إضافة
        </Button>
      </div>
      {links.length > 0 && (
        <ul className="list-disc list-inside space-y-1">
          {links.map((link, index) => (
            <li key={index}>
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {link}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};