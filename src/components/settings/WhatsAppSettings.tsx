import { Card, CardContent } from "@/components/ui/card";
import { SettingsHeader } from "./whatsapp-settings/SettingsHeader";
import { SettingsContainer } from "./whatsapp-settings/SettingsContainer";

export const WhatsAppSettings = () => {
  return (
    <Card dir="rtl">
      <SettingsHeader />
      <CardContent>
        <SettingsContainer />
      </CardContent>
    </Card>
  );
};