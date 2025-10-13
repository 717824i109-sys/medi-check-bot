import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";
import { toast } from "sonner";

interface QRScannerProps {
  onScan: (data: string) => void;
}

const QRScanner = ({ onScan }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Ignore frequent errors
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      toast.error("Failed to access camera. Please grant camera permissions.");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      setIsScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div 
        id="qr-reader" 
        className={`rounded-lg overflow-hidden ${isScanning ? "border-2 border-primary" : ""}`}
        style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}
      ></div>

      {!isScanning && (
        <div className="text-center p-12 border-2 border-dashed rounded-lg border-border">
          <div className="p-4 rounded-full bg-primary/10 inline-block mb-4">
            <Camera className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">QR/Barcode Scanner</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Position the QR code or barcode within the camera frame
          </p>
        </div>
      )}

      <div className="text-center">
        {!isScanning ? (
          <Button onClick={startScanning} size="lg" className="glow-primary">
            <Camera className="mr-2 h-5 w-5" />
            Start Camera
          </Button>
        ) : (
          <Button onClick={stopScanning} size="lg" variant="destructive">
            <CameraOff className="mr-2 h-5 w-5" />
            Stop Camera
          </Button>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
