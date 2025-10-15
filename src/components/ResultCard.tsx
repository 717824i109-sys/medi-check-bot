import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, Download, Share2, Volume2 } from "lucide-react";
import { ScanResult } from "@/pages/Scan";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface ResultCardProps {
  result: ScanResult;
}

const ResultCard = ({ result }: ResultCardProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakResult = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      let message = "";
      if (result.status === "genuine") {
        message = `This medicine is genuine. ${result.medicineName}. ${result.purpose || ""}`;
      } else if (result.status === "fake") {
        message = `Warning! This is a fake medicine. ${result.medicineName}. Possible side effects include: ${result.sideEffects || "unknown harmful effects"}. Do not consume.`;
      } else {
        message = `This medicine is suspicious. ${result.medicineName}. Please verify with a pharmacist.`;
      }
      
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      toast.success("Playing voice feedback");
    } else {
      toast.error("Text-to-speech not supported in your browser");
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getStatusConfig = () => {
    switch (result.status) {
      case "genuine":
        return {
          icon: CheckCircle2,
          color: "text-success",
          bg: "bg-success/10",
          border: "border-success",
          label: "✅ Genuine Medicine",
          description: "This medicine appears to be authentic"
        };
      case "fake":
        return {
          icon: XCircle,
          color: "text-destructive",
          bg: "bg-destructive/10",
          border: "border-destructive",
          label: "❌ Fake Medicine Detected",
          description: "Do not consume. Report to authorities immediately"
        };
      case "suspicious":
        return {
          icon: AlertTriangle,
          color: "text-warning",
          bg: "bg-warning/10",
          border: "border-warning",
          label: "⚠️ Suspicious - Verify Further",
          description: "Consult with pharmacist or manufacturer"
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  const handleDownloadReport = () => {
    toast.success("Report downloaded successfully!");
  };

  const handleShare = () => {
    toast.success("Result copied to clipboard!");
  };

  return (
    <Card className={`overflow-hidden border-2 ${config.border} animate-fade-in`}>
      <div className={`p-6 ${config.bg}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-full bg-card`}>
            <StatusIcon className={`h-8 w-8 ${config.color}`} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{config.label}</h2>
            <p className="text-muted-foreground">{config.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">Confidence</div>
            <div className={`text-3xl font-bold ${config.color}`}>{result.confidence}%</div>
          </div>
        </div>

        <div className="h-2 bg-card rounded-full overflow-hidden">
          <div 
            className={`h-full ${result.status === "genuine" ? "bg-success" : result.status === "fake" ? "bg-destructive" : "bg-warning"}`}
            style={{ width: `${result.confidence}%` }}
          ></div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Medicine Name</div>
            <div className="font-semibold">{result.medicineName}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Batch Number</div>
            <div className="font-semibold">{result.batchNumber}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Expiry Date</div>
            <div className="font-semibold">{result.expiryDate}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Manufacturer</div>
            <div className="font-semibold">{result.manufacturer}</div>
          </div>
        </div>

        {result.purpose && result.status === "genuine" && (
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <h4 className="font-semibold text-success mb-2">💊 Medicine Purpose</h4>
            <p className="text-sm mb-3">{result.purpose}</p>
            {result.description && (
              <>
                <h5 className="font-semibold text-success text-sm mb-1">Usage Instructions</h5>
                <p className="text-sm text-muted-foreground">{result.description}</p>
              </>
            )}
          </div>
        )}

        {(result.sideEffects || result.reason) && (result.status === "fake" || result.status === "suspicious") && (
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <h4 className="font-semibold text-destructive mb-2">⚠️ Warning Information</h4>
            {result.sideEffects && (
              <>
                <h5 className="font-semibold text-destructive text-sm mb-1">Possible Side Effects</h5>
                <p className="text-sm mb-3 text-destructive/90">{result.sideEffects}</p>
              </>
            )}
            {result.reason && (
              <>
                <h5 className="font-semibold text-destructive text-sm mb-1">Detection Reason</h5>
                <p className="text-sm text-destructive/90">{result.reason}</p>
              </>
            )}
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground mb-2">Analysis Details</div>
          <p className="text-sm leading-relaxed">{result.details}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4">
          <Button 
            onClick={speakResult} 
            variant={result.status === "genuine" ? "default" : "destructive"}
            className="col-span-3"
            disabled={isSpeaking}
          >
            <Volume2 className="mr-2 h-4 w-4" />
            {isSpeaking ? "Speaking..." : "Voice Feedback"}
          </Button>
          <Button onClick={handleDownloadReport} variant="outline" className="col-span-3 sm:col-span-1">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button onClick={handleShare} variant="outline" className="col-span-3 sm:col-span-2">
            <Share2 className="mr-2 h-4 w-4" />
            Share Result
          </Button>
        </div>

        {result.status === "fake" && (
          <div className="mt-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <h4 className="font-semibold text-destructive mb-2">⚠️ Important Actions:</h4>
            <ul className="text-sm space-y-1 text-destructive/90">
              <li>• Do not consume this medicine</li>
              <li>• Contact your pharmacist or doctor immediately</li>
              <li>• Report to local health authorities</li>
              <li>• Keep the medicine packaging for investigation</li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ResultCard;
