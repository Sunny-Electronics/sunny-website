import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Send, CheckCircle2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import sunnyLogo from "@assets/image_1775118121182.png";

export default function RequestAccess() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactHandler: "",
    phoneNumber: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const isFormValid =
    formData.companyName.trim() !== "" &&
    formData.contactHandler.trim() !== "" &&
    formData.phoneNumber.trim() !== "" &&
    formData.email.trim() !== "";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <nav className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={sunnyLogo} alt="Sunny Electronics Corp." className="h-10 w-auto" />
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-lg tracking-tight text-foreground">Sunny Electronics Corp.</span>
              <span className="text-[11px] text-muted-foreground font-medium tracking-wide">KOSPI-listed (KRX: 004770)</span>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-muted-foreground" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {!submitted ? (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <LogIn className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-display font-bold mb-3">Partners Portal</h1>
                <p className="text-muted-foreground">
                  Request access to the Sunny Electronics Corp. Partners Portal. Fill in your details below and our team will review your request.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    placeholder="Enter your company name"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    data-testid="input-company-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactHandler">Contact Handler</Label>
                  <Input
                    id="contactHandler"
                    name="contactHandler"
                    type="text"
                    placeholder="Full name of primary contact"
                    value={formData.contactHandler}
                    onChange={handleChange}
                    required
                    data-testid="input-contact-handler"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="+82 10 1234 5678"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    data-testid="input-phone-number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    data-testid="input-email"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base gap-2"
                  disabled={!isFormValid}
                  data-testid="button-submit-request"
                >
                  <Send className="w-4 h-4" />
                  Request Access
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-6">
                Already have access?{" "}
                <span className="text-primary font-medium">Portal login coming soon.</span>
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-3">Request Submitted</h2>
              <p className="text-muted-foreground mb-8">
                Thank you for your interest in partnering with Sunny Electronics Corp. Our team will review your request and contact you at <span className="font-medium text-foreground">{formData.email}</span> within 2 business days.
              </p>
              <Link href="/">
                <Button variant="outline" className="gap-2" data-testid="button-return-home">
                  <ArrowLeft className="w-4 h-4" />
                  Return to Home
                </Button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>

      <footer className="border-t border-border py-6 bg-background">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Sunny Electronics Corp. | Seoul, Korea |{" "}
          <a href="https://www.sunnykr.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">sunnykr.com</a>
        </div>
      </footer>
    </div>
  );
}
