import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, ScanLine, Database, ChartBar, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm">
                AI-Powered Medicine Verification
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Stop Fake Medicines with{" "}
                <span className="gradient-primary bg-clip-text text-transparent">
                  AI Technology
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Upload or scan medicine packaging instantly. Our advanced AI analyzes authenticity in seconds,
                protecting you from counterfeit drugs.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/scan">
                  <Button size="lg" className="glow-primary">
                    <ScanLine className="mr-2 h-5 w-5" />
                    Start Scanning Now
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">98%</div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">50K+</div>
                  <div className="text-sm text-muted-foreground">Scans Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">&lt;2s</div>
                  <div className="text-sm text-muted-foreground">Avg. Analysis Time</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl animate-pulse-glow"></div>
              <div className="relative bg-card/80 backdrop-blur-sm p-8 rounded-3xl card-shadow border border-border">
                <div className="aspect-square rounded-2xl bg-gradient-primary flex items-center justify-center relative overflow-hidden">
                  <Shield className="h-32 w-32 text-white opacity-20 absolute" />
                  <div className="absolute inset-0 bg-white/10 scan-animation"></div>
                  <div className="relative z-10 text-center text-white">
                    <ScanLine className="h-20 w-20 mx-auto mb-4" />
                    <p className="text-xl font-semibold">AI Scanning Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to verify your medicine's authenticity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-smooth border-2 hover:border-primary/50">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <ScanLine className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Upload or Scan</h3>
              <p className="text-muted-foreground">
                Take a photo of your medicine packaging or scan the QR/barcode using your camera.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-smooth border-2 hover:border-primary/50">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI Analysis</h3>
              <p className="text-muted-foreground">
                Our AI analyzes packaging details, OCR text, batch numbers, and verifies against our database.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-smooth border-2 hover:border-primary/50">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Get Results</h3>
              <p className="text-muted-foreground">
                Receive instant verification with confidence scores and detailed authenticity reports.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">The Global Fake Medicine Crisis</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">1 in 10 medicines in developing countries are fake</h3>
                    <p className="text-muted-foreground text-sm">WHO estimates over 1 million deaths annually from counterfeit medicines</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">$200 billion market for counterfeit drugs</h3>
                    <p className="text-muted-foreground text-sm">Criminal networks profit while patients suffer from ineffective treatments</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-success/10">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">AI can detect 98% of counterfeit medicines</h3>
                    <p className="text-muted-foreground text-sm">Advanced technology helps verify authenticity instantly and accurately</p>
                  </div>
                </div>
              </div>
              <Link to="/about" className="inline-block mt-6">
                <Button variant="outline">Read More Statistics</Button>
              </Link>
            </div>

            <div className="relative">
              <Card className="p-8 card-shadow">
                <ChartBar className="h-16 w-16 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-4">Our Impact</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Medicines Verified</span>
                      <span className="text-sm font-bold text-primary">50,482</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Fake Medicines Detected</span>
                      <span className="text-sm font-bold text-destructive">3,247</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-destructive rounded-full" style={{ width: "15%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">User Satisfaction</span>
                      <span className="text-sm font-bold text-success">97.8%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full" style={{ width: "97.8%" }}></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-primary rounded-3xl p-12 text-white card-shadow">
            <Shield className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-4xl font-bold mb-4">Protect Yourself Today</h2>
            <p className="text-lg mb-8 opacity-90">
              Don't take risks with your health. Verify your medicines in seconds with our AI-powered detector.
            </p>
            <Link to="/scan">
              <Button size="lg" variant="secondary" className="text-primary hover:scale-105 transition-smooth">
                Start Free Scan
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
