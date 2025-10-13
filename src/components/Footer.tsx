import { Shield, Mail, Github, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">MediGuard AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Protecting lives by detecting counterfeit medicines using advanced AI technology.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary transition-smooth">Home</Link></li>
              <li><Link to="/scan" className="hover:text-primary transition-smooth">Scan Medicine</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-smooth">Dashboard</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-smooth">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition-smooth">How It Works</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">FAQ</a></li>
              <li><Link to="/contact" className="hover:text-primary transition-smooth">Report Fake Medicine</Link></li>
              <li><a href="#" className="hover:text-primary transition-smooth">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-smooth">
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-smooth">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-smooth">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; 2025 MediGuard AI. All rights reserved. Built to combat counterfeit medicines worldwide.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
