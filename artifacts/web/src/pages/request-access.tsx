import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  LogIn,
  FileText,
  PackageSearch,
  ShieldCheck,
  ClipboardList,
  History,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import sunnyLogo from "@assets/image_1775118121182.png";

const portalFeatures = [
  {
    icon: <FileText className="w-5 h-5" />,
    title: "RFQ Status",
    text: "Track submitted requests, quote progress, and Sunny review status.",
  },
  {
    icon: <ClipboardList className="w-5 h-5" />,
    title: "PO / Order Status",
    text: "See confirmed ETD, order stage, and shipment progress later.",
  },
  {
    icon: <Warehouse className="w-5 h-5" />,
    title: "Sunny Stock",
    text: "View approved stock information for your own customer account.",
  },
  {
    icon: <History className="w-5 h-5" />,
    title: "Quote History",
    text: "Refer back to previous quotes and customer-specific records.",
  },
  {
    icon: <PackageSearch className="w-5 h-5" />,
    title: "Documents",
    text: "Find standard datasheets and request QA document packages.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Secure Access",
    text: "Customers only see their own company data. Admin data stays private.",
  },
];

export default function RequestAccess() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactHandler: "",
    phoneNumber: "",
    email: "",
    customerCode: "",
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

      <div className="flex-1 px-6 py-16">
        <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[1fr_460px] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-6">
              Customer Portal
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-5">
              Secure access for Sunny partners.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-8">
              Existing customers will use the portal to review RFQs, orders, quote history,
              approved stock information, and document requests. New access requests are reviewed
              by Sunny before an account is created.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {portalFeatures.map((feature) => (
                <div key={feature.title} className="border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <h2 className="font-display font-bold text-lg">{feature.title}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground leading-6">{feature.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full"
        >
          {!submitted ? (
            <div className="bg-card border border-border p-6 shadow-sm">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <LogIn className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl font-display font-bold mb-3">Request Portal Access</h2>
                <p className="text-muted-foreground">
                  Fill in your details and Sunny will review your company before access is approved.
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
                  <Label htmlFor="customerCode">Sunny Customer Code</Label>
                  <Input
                    id="customerCode"
                    name="customerCode"
                    type="text"
                    placeholder="Optional if you already know it"
                    value={formData.customerCode}
                    onChange={handleChange}
                    data-testid="input-customer-code"
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
              className="text-center bg-card border border-border p-8 shadow-sm"
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
      </div>

      <footer className="border-t border-border py-6 bg-background">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Sunny Electronics Corp. | Seoul, Korea |{" "}
          <a href="https://www.sunnykr.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">sunnykr.com</a>
        </div>
      </footer>
    </div>
  );
}
