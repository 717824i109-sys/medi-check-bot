import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, Download, Share2 } from "lucide-react";
import { ScanResult } from "@/pages/Scan";
import { toast } from "sonner";

interface ResultCardProps {
  result: ScanResult;
}

const ResultCard = ({ result }: ResultCardProps) => {
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

        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground mb-2">Analysis Details</div>
          <p className="text-sm leading-relaxed">{result.details}</p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleDownloadReport} variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex-1">
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
