import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Camera, QrCode, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import QRScanner from "@/components/QRScanner";
import UploadArea from "@/components/UploadArea";
import ResultCard from "@/components/ResultCard";

export type ScanResult = {
  status: "genuine" | "fake" | "suspicious";
  confidence: number;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  manufacturer: string;
  details: string;
};

const Scan = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const simulateAIAnalysis = async (source: string) => {
    setIsAnalyzing(true);
    setResult(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Random result for demo
    const outcomes: ScanResult["status"][] = ["genuine", "fake", "suspicious"];
    const randomStatus = outcomes[Math.floor(Math.random() * outcomes.length)];

    const mockResult: ScanResult = {
      status: randomStatus,
      confidence: Math.floor(Math.random() * 20) + 80,
      medicineName: "Paracetamol 500mg",
      batchNumber: "BATCH" + Math.floor(Math.random() * 100000),
      expiryDate: "12/2026",
      manufacturer: "Generic Pharma Ltd.",
      details: randomStatus === "genuine" 
        ? "All packaging details match our database. Batch number verified. Security features present."
        : randomStatus === "fake"
        ? "Packaging inconsistencies detected. Batch number not found in manufacturer database. Missing security hologram."
        : "Some packaging details match, but batch number verification failed. Recommend further verification."
    };

    setResult(mockResult);
    setIsAnalyzing(false);

    // Save to history
    const history = JSON.parse(localStorage.getItem("scanHistory") || "[]");
    history.unshift({
      ...mockResult,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    });
    localStorage.setItem("scanHistory", JSON.stringify(history.slice(0, 20)));

    toast.success("Analysis complete!");
  };

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    simulateAIAnalysis("upload");
  };

  const handleQRScan = (data: string) => {
    toast.success("QR Code scanned: " + data);
    simulateAIAnalysis("qr");
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Scan Medicine</h1>
          <p className="text-lg text-muted-foreground">
            Upload an image or scan QR code to verify authenticity
          </p>
        </div>

        <Card className="p-6 mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </TabsTrigger>
              <TabsTrigger value="qr">
                <QrCode className="mr-2 h-4 w-4" />
                Scan QR Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-6">
              <UploadArea onImageUpload={handleImageUpload} />
              
              {uploadedImage && (
                <div className="mt-6">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded medicine" 
                    className="max-w-md mx-auto rounded-lg border-2 border-border"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="qr" className="mt-6">
              <QRScanner onScan={handleQRScan} />
            </TabsContent>
          </Tabs>

          {isAnalyzing && (
            <Card className="mt-8 p-8 text-center bg-primary/5 border-primary/20">
              <div className="animate-pulse-glow inline-block p-4 rounded-full bg-primary/10 mb-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analyzing Medicine...</h3>
              <p className="text-muted-foreground">AI is verifying packaging details, batch numbers, and security features</p>
              <div className="mt-6 max-w-md mx-auto space-y-2">
                <div className="flex justify-between text-sm">
                  <span>OCR Text Extraction</span>
                  <span className="text-success">✓ Complete</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Batch Verification</span>
                  <span className="text-primary">Processing...</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Security Features</span>
                  <span className="text-muted-foreground">Pending</span>
                </div>
              </div>
            </Card>
          )}
        </Card>

        {result && <ResultCard result={result} />}
      </div>
    </div>
  );
};

export default Scan;
