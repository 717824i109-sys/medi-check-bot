import { Card } from "@/components/ui/card";
import { Shield, Globe, Users, Target, TrendingUp, AlertCircle } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-block p-4 rounded-full bg-primary/10 mb-6">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-6">About MediGuard AI</h1>
          <p className="text-xl text-muted-foreground">
            Leveraging artificial intelligence to combat the global counterfeit medicine crisis
            and protect lives worldwide.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                We're on a mission to make medicine verification accessible to everyone. By combining
                cutting-edge AI technology with user-friendly design, we empower patients, pharmacists,
                and healthcare workers to instantly verify medicine authenticity.
              </p>
              <p className="text-lg text-muted-foreground">
                Every scan helps build a safer healthcare ecosystem and saves lives by preventing
                consumption of dangerous counterfeit medicines.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center card-shadow">
                <Target className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold mb-2">98%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </Card>
              <Card className="p-6 text-center card-shadow">
                <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold mb-2">10K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </Card>
              <Card className="p-6 text-center card-shadow">
                <Globe className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold mb-2">15+</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </Card>
              <Card className="p-6 text-center card-shadow">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold mb-2">50K+</div>
                <div className="text-sm text-muted-foreground">Scans Completed</div>
              </Card>
            </div>
          </div>

          {/* The Problem */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold mb-8 text-center">The Global Crisis</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 border-destructive/20">
                <AlertCircle className="h-10 w-10 text-destructive mb-4" />
                <h3 className="font-bold text-xl mb-3">1 in 10 Medicines</h3>
                <p className="text-muted-foreground">
                  In developing countries are substandard or falsified according to WHO estimates.
                </p>
              </Card>

              <Card className="p-6 border-destructive/20">
                <AlertCircle className="h-10 w-10 text-destructive mb-4" />
                <h3 className="font-bold text-xl mb-3">$200 Billion Market</h3>
                <p className="text-muted-foreground">
                  Global counterfeit medicine market value, profiting criminals while endangering lives.
                </p>
              </Card>

              <Card className="p-6 border-destructive/20">
                <AlertCircle className="h-10 w-10 text-destructive mb-4" />
                <h3 className="font-bold text-xl mb-3">1 Million+ Deaths</h3>
                <p className="text-muted-foreground">
                  Annual deaths attributed to substandard and falsified medical products globally.
                </p>
              </Card>
            </div>
          </div>

          {/* How We Help */}
          <div className="bg-card rounded-3xl p-12">
            <h2 className="text-4xl font-bold mb-8 text-center">How We're Making a Difference</h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-xl">1</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Advanced AI Technology</h3>
                  <p className="text-muted-foreground">
                    Our machine learning models analyze packaging details, OCR text, batch numbers,
                    and security features with 98% accuracy in under 2 seconds.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-xl">2</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Accessible to Everyone</h3>
                  <p className="text-muted-foreground">
                    No specialized equipment needed. Just a smartphone camera to verify medicines
                    anytime, anywhere. Free for individual users.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-xl">3</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Continuous Database Updates</h3>
                  <p className="text-muted-foreground">
                    We partner with pharmaceutical companies and regulatory authorities to maintain
                    an up-to-date database of genuine medicines and known counterfeits.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-xl">4</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Community Reporting</h3>
                  <p className="text-muted-foreground">
                    Users can report suspected counterfeit medicines directly to health authorities,
                    creating a crowdsourced safety network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
