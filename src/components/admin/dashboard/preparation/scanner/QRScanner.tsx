import { FC, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useIsMobile } from "@/hooks/use-mobile";

interface QRScannerProps {
  onScan: (code: string) => void;
}

export const QRScanner: FC<QRScannerProps> = ({ onScan }) => {
  const isMobile = useIsMobile();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10,
        qrbox: isMobile ? 250 : 300,
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render((decodedText) => {
      console.log("Barcode scanned:", decodedText);
      onScan(decodedText);
      scanner.clear();
    }, (error) => {
      console.error("QR scan error:", error);
    });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScan, isMobile]);

  return <div id="reader" className="w-full" />;
};