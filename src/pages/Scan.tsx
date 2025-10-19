import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Camera, QrCode, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import QRScanner from "@/components/QRScanner";
import UploadArea from "@/components/UploadArea";
import ResultCard from "@/components/ResultCard";
import { analyzeMedicineImage } from "@/services/medicineAnalysis";
import { supabase } from "@/integrations/supabase/client";

export type ScanResult = {
  status: "genuine" | "fake" | "suspicious";
  confidence: number;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  manufacturer: string;
  details: string;
  purpose?: string;
  description?: string;
  sideEffects?: string;
  reason?: string;
};

const Scan = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const analyzeWithModel = async (imageData: string) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      // Call your trained model
      const analysisResult = await analyzeMedicineImage(imageData);
      
      // Fetch additional info from database based on status
      let enrichedResult = { ...analysisResult };
      
      if (analysisResult.status === "genuine") {
        const { data, error } = await supabase
          .from("medicine_info")
          .select("purpose, description")
          .ilike("name", `%${analysisResult.medicineName}%`)
          .maybeSingle();
        
        if (data && !error) {
          enrichedResult = {
            ...enrichedResult,
            purpose: data.purpose,
            description: data.description
          };
        }
      } else if (analysisResult.status === "fake" || analysisResult.status === "suspicious") {
        const { data, error } = await supabase
          .from("fake_medicine_effects")
          .select("side_effects, reason")
          .ilike("name", `%${analysisResult.medicineName}%`)
          .maybeSingle();
        
        if (data && !error) {
          enrichedResult = {
            ...enrichedResult,
            sideEffects: data.side_effects,
            reason: data.reason
          };
        }
      }
      
      setResult(enrichedResult);
      
      // Save to history
      const history = JSON.parse(localStorage.getItem("scanHistory") || "[]");
      history.unshift({
        ...enrichedResult,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      });
      localStorage.setItem("scanHistory", JSON.stringify(history.slice(0, 20)));

      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Failed to analyze image. Please check your model configuration.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    analyzeWithModel(imageUrl);
  };

  const handleQRScan = (data: string) => {
    toast.success("QR Code scanned successfully!");
    
    // Check if the QR code contains a URL (image link)
    if (data.startsWith("http://") || data.startsWith("https://")) {
      setUploadedImage(data);
      analyzeWithModel(data);
    } else {
      // If it's not a URL, treat it as base64 or raw data
      setUploadedImage(data);
      analyzeWithModel(data);
    }
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
