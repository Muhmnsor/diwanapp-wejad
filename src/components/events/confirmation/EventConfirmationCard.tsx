
import { QrCode, User, MapPin, Calendar, Clock, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';
import { formatTime12Hour } from '@/utils/dateTimeUtils';

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
        <span className="flex-1 text-right text-sm">{date}</span>
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
      <MessageSquare className="w-4 h-4 text-[#25D366]" />
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
