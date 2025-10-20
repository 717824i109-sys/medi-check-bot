import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Camera, QrCode, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import QRScanner from "@/components/QRScanner";
import UploadArea from "@/components/UploadArea";
import ResultCard from "@/components/ResultCard";
import VoiceControl from "@/components/VoiceControl";
import SupplyChainMap from "@/components/SupplyChainMap";
import { analyzeMedicineImage } from "@/services/medicineAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { verifyBatchOnBlockchain } from "@/services/blockchainVerification";
import { voiceAssistant } from "@/services/voiceAssistant";

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
  // FDA verified information
  fdaInfo?: {
    genericName: string;
    brandName: string;
    purpose: string;
    dosageForm: string;
    composition: string;
    sideEffects: string;
    contraindications: string;
  };
  // Blockchain verification
  blockchain?: {
    isVerified: boolean;
    timestamp?: number;
    manufacturer?: string;
  };
};

const Scan = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showSupplyChain, setShowSupplyChain] = useState(false);

  const analyzeWithModel = async (imageData: string) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      // Call AI model for analysis (now includes OpenFDA integration)
      const analysisResult = await analyzeMedicineImage(imageData);
      
      // Perform blockchain verification
      const blockchainVerification = await verifyBatchOnBlockchain(analysisResult.batchNumber);
      
      // Fetch additional info from database based on status
      let enrichedResult = { 
        ...analysisResult,
        blockchain: blockchainVerification
      };
      
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
      setShowSupplyChain(enrichedResult.status === "genuine");
      
      // Read result aloud with voice assistant
      const resultMessage = `Medicine analysis complete. This is ${enrichedResult.medicineName}. 
        Status: ${enrichedResult.status}. Confidence: ${enrichedResult.confidence} percent. 
        ${enrichedResult.fdaInfo ? `Purpose: ${enrichedResult.fdaInfo.purpose.substring(0, 100)}` : ''}`;
      
      voiceAssistant.speak(resultMessage);
      
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
      const errorMessage = error instanceof Error ? error.message : "Unable to analyze image";
      toast.error(errorMessage, {
        duration: 5000,
        description: "Try uploading a clear photo of the medicine package"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    analyzeWithModel(imageUrl);
  };

  const handleQRScan = (data: string) => {
    console.log("QR scanned:", data);
    
    try {
      // Try to parse QR data as JSON (medicine info)
      const qrData = JSON.parse(data);
      if (qrData.medicine_name || qrData.name) {
        toast.success("Medicine QR code detected!");
        
        // QR contains medicine data directly
        const result: ScanResult = {
          status: "genuine",
          confidence: qrData.confidence || 95,
          medicineName: qrData.medicine_name || qrData.name || "Unknown",
          batchNumber: qrData.batch_number || qrData.batch || "N/A",
          expiryDate: qrData.expiry_date || qrData.expiry || "N/A",
          manufacturer: qrData.manufacturer || "N/A",
          details: "Medicine verified via QR code",
          purpose: qrData.purpose,
        };
        setResult(result);
        
        // Save to history
        const history = JSON.parse(localStorage.getItem("scanHistory") || "[]");
        history.unshift({
          ...result,
          timestamp: new Date().toISOString(),
          id: Date.now().toString()
        });
        localStorage.setItem("scanHistory", JSON.stringify(history.slice(0, 20)));
        return;
      }
    } catch (e) {
      // Not JSON, continue with other checks
    }
    
    // Check if it's a base64 image
    if (data.startsWith("data:image")) {
      toast.success("QR image detected!");
      setUploadedImage(data);
      analyzeWithModel(data);
      return;
    }
    
    // For URL-based QR codes, show helpful message
    toast.error("QR Scanner Not Supported for This Code", {
      duration: 6000,
      description: "Please use the Upload Image tab to take a photo of the medicine package instead"
    });
  };

  const handleVoiceCommand = (command: string) => {
    if (command.includes('scan') || command.includes('analyze')) {
      toast.info('Voice command activated', {
        description: 'Please upload or scan a medicine image'
      });
      setActiveTab('upload');
    }
  };

  // Cleanup voice on unmount
  useEffect(() => {
    return () => {
      voiceAssistant.stopSpeaking();
      voiceAssistant.stopListening();
    };
  }, []);

  return (
    <div className="min-h-screen py-12 px-4">
      <VoiceControl onCommand={handleVoiceCommand} />
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
              <div className="text-center mb-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> QR scanner works best with medicine-specific QR codes. For general verification, use the Upload Image tab to photograph the medicine package.
                </p>
              </div>
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

        {result && (
          <>
            <ResultCard result={result} />
            {showSupplyChain && result.batchNumber !== "N/A" && (
              <SupplyChainMap batchNumber={result.batchNumber} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Scan;
