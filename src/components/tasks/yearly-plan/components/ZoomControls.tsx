
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ZoomControlsProps {
  value: number;
  onChange: (value: number) => void;
}

export const ZoomControls = ({ value, onChange }: ZoomControlsProps) => {
  const decreaseZoom = () => {
    if (value > 50) onChange(value - 25);
  };

  const increaseZoom = () => {
    if (value < 200) onChange(value + 25);
  };

  return (
    <div className="flex items-center gap-2 min-w-[200px]">
      <Button variant="outline" size="icon" onClick={decreaseZoom}>
        <ZoomOut size={16} />
      </Button>
      
      <Slider
        value={[value]}
        min={50}
        max={200}
        step={25}
        onValueChange={(values) => onChange(values[0])}
        className="w-24"
      />
      
      <Button variant="outline" size="icon" onClick={increaseZoom}>
        <ZoomIn size={16} />
      </Button>
      
      <span className="text-xs ml-2">{value}%</span>
    </div>
  );
};
