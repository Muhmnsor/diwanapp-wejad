
import { QrCode, User, MapPin, Calendar, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';
import { formatTime12Hour, formatDateWithDay } from '@/utils/dateTimeUtils';

interface EventConfirmationCardProps {
  eventTitle: string;
  registrationId: string;
  registrantInfo: {
    name: string;
    email: string;
    phone: string;
  };
  eventDetails?: {
    date?: string;
    time?: string;
    location?: string;
    location_url?: string | { _type: string; value: string };
  };
}

const ParticipantInfo = ({ name }: { name: string }) => (
  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-2.5 flex items-center gap-3">
    <User className="w-4 h-4 text-primary shrink-0" />
    <span className="text-base font-semibold flex-1 text-right">{name}</span>
  </div>
);

const RegistrationQRCode = ({ registrationId }: { registrationId: string }) => (
  <div className="bg-white/50 backdrop-blur-sm p-3 rounded-xl text-center">
    <div className="mx-auto mb-2 bg-white p-2 rounded-lg inline-block">
      <QRCodeSVG 
        value={registrationId}
        size={84}
        level="H"
        includeMargin={true}
      />
    </div>
    <div className="text-sm text-gray-600">رقم التسجيل</div>
    <div className="font-mono text-xs mt-0.5 dir-ltr">{registrationId}</div>
  </div>
);

const LocationQRCode = ({ locationUrl }: { locationUrl?: string | { _type: string; value: string } }) => {
  const url = typeof locationUrl === 'object' ? locationUrl?.value : locationUrl;

  if (url && typeof url === 'string' && url.trim() && url !== 'undefined') {
    console.log('Using location URL:', url);
    return (
      <div className="bg-white/50 backdrop-blur-sm p-3 rounded-xl text-center">
        <div className="mx-auto mb-2 bg-white p-2 rounded-lg inline-block">
          <QRCodeSVG 
            value={url}
            size={84}
            level="H"
            includeMargin={true}
          />
        </div>
        <div className="text-sm text-gray-600">موقع الفعالية</div>
        <div className="font-mono text-xs mt-0.5">امسح للوصول للموقع</div>
      </div>
    );
  }

  console.log('LocationQRCode: لا يوجد رابط صالح', { locationUrl, url });
  return null;
};

const QRCodeSection = ({ registrationId, location_url }: { 
  registrationId: string; 
  location_url?: string | { _type: string; value: string };
}) => {
  console.log('QRCodeSection - المدخلات:', {
    registrationId,
    location_url,
    location_url_type: typeof location_url,
    location_url_value: typeof location_url === 'object' ? location_url?.value : location_url
  });

  return (
    <div className="grid grid-cols-2 gap-3">
      <RegistrationQRCode registrationId={registrationId} />
      <LocationQRCode locationUrl={location_url} />
    </div>
  );
};

const EventDetails = ({ date, time, location }: { date?: string; time?: string; location?: string }) => (
  <div className="space-y-1.5">
    {date && (
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-2 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-primary shrink-0" />
        <span className="flex-1 text-right text-sm">{formatDateWithDay(date)}</span>
      </div>
    )}
    {time && (
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-2 flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary shrink-0" />
        <span className="flex-1 text-right text-sm">{formatTime12Hour(time)}</span>
      </div>
    )}
    {location && (
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-2 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary shrink-0" />
        <span className="flex-1 text-right text-sm">{location}</span>
      </div>
    )}
  </div>
);

const WhatsAppContact = () => (
  <div className="mt-3 bg-white/50 backdrop-blur-sm rounded-xl p-3 text-center">
    <div className="text-sm text-gray-600 mb-1">للاستفسارات يرجى التواصل عبر</div>
    <a 
      href="https://wa.me/966592544688" 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        fill="#25D366" 
        viewBox="0 0 16 16"
        className="w-4 h-4"
      >
        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
      </svg>
      <span dir="ltr" className="text-sm font-medium text-gray-700">
        +966 59 254 4688
      </span>
    </a>
  </div>
);

export const EventConfirmationCard = ({
  eventTitle,
  registrationId,
  registrantInfo,
  eventDetails
}: EventConfirmationCardProps) => {
  console.log('EventConfirmationCard - البيانات:', {
    eventTitle,
    registrationId,
    registrantInfo,
    eventDetails,
    locationUrl: eventDetails?.location_url,
    locationUrlType: typeof eventDetails?.location_url
  });

  return (
    <Card id="confirmation-card" className="max-w-md mx-auto overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary/90 to-primary pt-6 pb-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        </div>
        <div className="relative px-6 text-center text-white">
          <img 
            src="/lovable-uploads/cdbe8500-c605-4cde-9981-0ed24e21991c.png"
            alt="ديوان"
            className="w-40 h-auto mx-auto mb-2 object-contain"
          />
          <div className="text-xl font-bold mb-0.5">{eventTitle}</div>
          <div className="text-sm opacity-90">بطاقة تأكيد التسجيل</div>
        </div>
        <div className="absolute -bottom-6 left-0 right-0">
          <svg className="w-full h-6" viewBox="0 0 400 24" fill="none">
            <path d="M0 24C200 -8 400 24 400 24H0Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 pt-6 space-y-3 bg-gradient-to-b from-gray-50/50 to-white">
        <ParticipantInfo name={registrantInfo.name} />
        <EventDetails {...eventDetails} />
        <QRCodeSection 
          registrationId={registrationId} 
          location_url={eventDetails?.location_url}
        />
        <WhatsAppContact />
      </div>
    </Card>
  );
};
