import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { ScanResult } from "@/pages/Scan";

type ScanHistoryItem = ScanResult & {
  timestamp: string;
  id: string;
};

const Dashboard = () => {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [filter, setFilter] = useState<"all" | "genuine" | "fake" | "suspicious">("all");

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("scanHistory") || "[]");
    setHistory(savedHistory);
  }, []);

  const getFilteredHistory = () => {
    if (filter === "all") return history;
    return history.filter(item => item.status === filter);
  };

  const getStats = () => {
    return {
      total: history.length,
      genuine: history.filter(h => h.status === "genuine").length,
      fake: history.filter(h => h.status === "fake").length,
      suspicious: history.filter(h => h.status === "suspicious").length,
    };
  };

  const stats = getStats();
  const filteredHistory = getFilteredHistory();

  const getStatusBadge = (status: ScanResult["status"]) => {
    switch (status) {
      case "genuine":
        return <Badge className="bg-success text-success-foreground">✓ Genuine</Badge>;
      case "fake":
        return <Badge className="bg-destructive text-destructive-foreground">✗ Fake</Badge>;
      case "suspicious":
        return <Badge className="bg-warning text-warning-foreground">⚠ Suspicious</Badge>;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your medicine verification history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 hover:shadow-lg transition-smooth">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Scans</span>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-smooth border-success/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Genuine</span>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <div className="text-3xl font-bold text-success">{stats.genuine}</div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-smooth border-destructive/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Fake</span>
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
            <div className="text-3xl font-bold text-destructive">{stats.fake}</div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-smooth border-warning/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Suspicious</span>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
            <div className="text-3xl font-bold text-warning">{stats.suspicious}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Scan History</h2>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="genuine">Genuine ({stats.genuine})</TabsTrigger>
                <TabsTrigger value="fake">Fake ({stats.fake})</TabsTrigger>
                <TabsTrigger value="suspicious">Suspicious ({stats.suspicious})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* History List */}
          <div className="space-y-4">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {filter === "all" 
                    ? "No scans yet. Start by scanning your first medicine!" 
                    : `No ${filter} medicines found.`}
                </p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <Card key={item.id} className="p-4 hover:shadow-md transition-smooth">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{item.medicineName}</h3>
                        {getStatusBadge(item.status)}
                        <span className="text-sm text-muted-foreground">
                          {item.confidence}% confidence
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                        <div>Batch: {item.batchNumber}</div>
                        <div>Expiry: {item.expiryDate}</div>
                        <div>Mfg: {item.manufacturer}</div>
                        <div className="text-xs">
                          {new Date(item.timestamp).toLocaleDateString()} at{" "}
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
