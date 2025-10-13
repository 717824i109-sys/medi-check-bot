import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(1000),
  medicineName: z.string().trim().max(200).optional(),
  batchNumber: z.string().trim().max(100).optional(),
});

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    medicineName: "",
    batchNumber: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      contactSchema.parse(formData);
      setIsSubmitting(true);

      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success("Report submitted successfully! We'll review it within 24 hours.");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        medicineName: "",
        batchNumber: "",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to submit report. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us & Report Fake Medicine</h1>
          <p className="text-lg text-muted-foreground">
            Help us combat counterfeit medicines. Report suspicious products or get in touch with our team.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="p-6 text-center hover:shadow-lg transition-smooth">
            <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Email Us</h3>
            <p className="text-sm text-muted-foreground">support@mediguard.ai</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-smooth">
            <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Call Us</h3>
            <p className="text-sm text-muted-foreground">+1 (800) MEDI-GUARD</p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-smooth">
            <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Visit Us</h3>
            <p className="text-sm text-muted-foreground">123 Health St, Medical District</p>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Report Form */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <h2 className="text-2xl font-bold">Report Fake Medicine</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  maxLength={255}
                />
              </div>

              <div>
                <Label htmlFor="medicineName">Medicine Name</Label>
                <Input
                  id="medicineName"
                  name="medicineName"
                  value={formData.medicineName}
                  onChange={handleChange}
                  placeholder="e.g., Paracetamol 500mg"
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  id="batchNumber"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  placeholder="e.g., BATCH12345"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief description of the issue"
                  required
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="message">Detailed Report *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please provide as much detail as possible: where you got the medicine, why you suspect it's fake, any unusual characteristics..."
                  rows={6}
                  required
                  maxLength={1000}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full glow-primary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </form>
          </Card>

          {/* Info Section */}
          <div className="space-y-6">
            <Card className="p-6 bg-destructive/10 border-destructive/20">
              <h3 className="font-bold text-lg mb-3 text-destructive">⚠️ If You Have Fake Medicine:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">1.</span>
                  <span>Stop using it immediately and do not give it to anyone else</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">2.</span>
                  <span>Keep the medicine and packaging for evidence</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">3.</span>
                  <span>Contact your doctor or pharmacist right away</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">4.</span>
                  <span>Report to local health authorities and fill out this form</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive font-bold">5.</span>
                  <span>If you've taken the medicine and feel unwell, seek medical attention</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-3">What Happens After You Report?</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span>Your report is immediately logged in our system</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span>Our team reviews all reports within 24 hours</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span>We notify relevant health authorities</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span>The medicine is added to our watchlist database</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon />
                  <span>You'll receive updates on the investigation</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="font-bold text-lg mb-3">Emergency Contacts</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Medical Emergency:</strong> 911</p>
                <p><strong>Poison Control:</strong> 1-800-222-1222</p>
                <p><strong>FDA MedWatch:</strong> 1-800-FDA-1088</p>
                <p><strong>WHO Hotline:</strong> +41 22 791 21 11</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckIcon = () => (
  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-success/20 flex items-center justify-center mt-0.5">
    <div className="h-2 w-2 rounded-full bg-success" />
  </div>
);

export default Contact;
