
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useDeveloperStore } from '@/store/developerStore';
import { Code, Loader2 } from 'lucide-react';

export const DeveloperToolbar = () => {
  const { settings, isLoading, fetchSettings, toggleDevMode } = useDeveloperStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (isLoading) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button variant="outline" size="sm" disabled>
          <Loader2 className="h-4 w-4 animate-spin ml-2" />
          جارٍ التحميل...
        </Button>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button
        variant={settings.is_enabled ? "default" : "outline"}
        size="sm"
        onClick={toggleDevMode}
        className="gap-2"
      >
        <Code className="h-4 w-4" />
        {settings.is_enabled ? 'وضع المطور مفعل' : 'وضع المطور معطل'}
      </Button>
    </div>
  );
};
