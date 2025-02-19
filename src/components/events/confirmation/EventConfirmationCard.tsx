
import { QrCode, User, Phone, Mail, MapPin, Calendar, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { QRCodeSVG } from 'qrcode.react';

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

const ParticipantInfo = ({ name, phone, email }: { name: string; phone: string; email: string }) => (
  <div className="space-y-4 mb-8">
    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between gap-3">
      <User className="w-5 h-5 text-primary" />
      <span className="text-lg font-semibold flex-1 text-right">{name}</span>
    </div>

    <div className="grid grid-cols-1 gap-3">
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between gap-3">
        <Phone className="w-4 h-4 text-primary" />
        <span className="flex-1 text-right" dir="ltr">{phone}</span>
      </div>
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between gap-3">
        <Mail className="w-4 h-4 text-primary" />
        <span className="flex-1 text-right" dir="ltr">{email}</span>
      </div>
    </div>
  </div>
);

const RegistrationQRCode = ({ registrationId }: { registrationId: string }) => (
  <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl text-center">
    <div className="mx-auto mb-2 bg-white p-2 rounded-lg inline-block">
      <QRCodeSVG 
        value={registrationId}
        size={96}
        level="H"
        includeMargin={true}
      />
    </div>
    <div className="text-sm text-gray-600">رقم التسجيل</div>
    <div className="font-mono text-xs mt-1">{registrationId}</div>
  </div>
);

const LocationQRCode = ({ locationUrl }: { locationUrl?: string | { _type: string; value: string } }) => {
  // تحويل location_url إلى نص إذا كان object
  const url = typeof locationUrl === 'object' ? locationUrl?.value : locationUrl;

  if (url && typeof url === 'string' && url.trim() && url !== 'undefined') {
    console.log('Using location URL:', url);
    return (
      <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl text-center">
        <div className="mx-auto mb-2 bg-white p-2 rounded-lg inline-block">
          <QRCodeSVG 
            value={url}
            size={96}
            level="H"
            includeMargin={true}
          />
        </div>
        <div className="text-sm text-gray-600">موقع الفعالية</div>
        <div className="font-mono text-xs mt-1">امسح للوصول للموقع</div>
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
    <div className="grid grid-cols-2 gap-4 mb-6">
      <RegistrationQRCode registrationId={registrationId} />
      <LocationQRCode locationUrl={location_url} />
    </div>
  );
};

const EventDetails = ({ date, time, location }: { date?: string; time?: string; location?: string }) => (
  <div className="space-y-3">
    {date && (
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between gap-3">
        <Calendar className="w-4 h-4 text-primary" />
        <span className="flex-1 text-right">{date}</span>
      </div>
    )}
    {time && (
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between gap-3">
        <Clock className="w-4 h-4 text-primary" />
        <span className="flex-1 text-right">{time}</span>
      </div>
    )}
    {location && (
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between gap-3">
        <MapPin className="w-4 h-4 text-primary" />
        <span className="flex-1 text-right">{location}</span>
      </div>
    )}
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
    <Card id="confirmation-card" className="max-w-md mx-auto overflow-hidden">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary/90 to-primary pt-12 pb-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        </div>
        <div className="relative px-6 text-center text-white">
          <Logo className="w-16 h-16 mx-auto mb-4" />
          <div className="text-2xl font-bold mb-1">{eventTitle}</div>
          <div className="text-sm opacity-90">بطاقة تأكيد التسجيل</div>
        </div>
        <div className="absolute -bottom-6 left-0 right-0">
          <svg className="w-full h-6" viewBox="0 0 400 24" fill="none">
            <path d="M0 24C200 -8 400 24 400 24H0Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pt-8 space-y-6 bg-gradient-to-b from-gray-50/50 to-white">
        <ParticipantInfo {...registrantInfo} />
        <QRCodeSection 
          registrationId={registrationId} 
          location_url={eventDetails?.location_url}
        />
        <EventDetails {...eventDetails} />
      </div>
    </Card>
  );
};
