import { QRCodeSVG } from "qrcode.react";

interface ConfirmationQRProps {
  registrationId: string;
}

export const ConfirmationQR = ({ registrationId }: ConfirmationQRProps) => {
  return (
    <div className="flex justify-center py-4">
      <QRCodeSVG
        value={registrationId}
        size={150}
        level="H"
        includeMargin={true}
        className="qr-code"
      />
    </div>
  );
};