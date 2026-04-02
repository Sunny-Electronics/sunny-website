import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { ChevronRight, Cpu, RadioReceiver, Activity, Globe2, ShieldCheck, ArrowRight, Factory, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">Sunny Electronics</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-muted-foreground">
            <a href="#about" className="hover:text-foreground transition-colors">Legacy</a>
            <a href="#products" className="hover:text-foreground transition-colors">Solutions</a>
            <a href="#industries" className="hover:text-foreground transition-colors">Industries</a>
            <a href="#quality" className="hover:text-foreground transition-colors">Quality</a>
            <Button>Partner With Us</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y, opacity }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/20 z-10" />
          <img 
            src="/hero-bg.png" 
            alt="Precision Crystal Oscillator" 
            className="w-full h-full object-cover object-right"
          />
        </motion.div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Precision Frequency Control Since 1966
              </div>
              <h1 className="text-6xl md:text-7xl font-display font-bold tracking-tight leading-[1.1] mb-6">
                The Heartbeat of <br/>
                <span className="text-primary">Global Innovation.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                We engineer world-class crystal oscillators, resonators, and filters. Powering the most demanding technologies across automotive, telecommunications, and consumer electronics.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="h-14 px-8 text-base group">
                  Explore Solutions 
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base">
                  View Specifications
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust / Partners */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-8">
            Trusted by Global Industry Leaders
          </p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['LG', 'Samsung', 'Garmin', 'Foxconn', 'Flex'].map((brand) => (
              <div key={brand} className="text-2xl font-display font-bold text-foreground">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legacy & Fabless Model */}
      <section id="about" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">58 Years of Uncompromising Precision.</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Established in 1966, Sunny Electronics has evolved from a pioneering domestic manufacturer to a global fabless semiconductor leader. Our commitment to frequency control technology spans nearly six decades.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Operating on a highly efficient fabless model, we invest heavily in R&D and strict quality assurance while leveraging a managed global supply chain to deliver scalability without sacrificing precision.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl font-display font-bold text-primary mb-2">1966</div>
                  <div className="text-sm font-medium text-muted-foreground">Year Established</div>
                </div>
                <div>
                  <div className="text-4xl font-display font-bold text-primary mb-2">Tier-1</div>
                  <div className="text-sm font-medium text-muted-foreground">Global Supplier</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-muted"
            >
              <img src="/lab-rd.png" alt="R&D Lab" className="w-full h-full object-cover" />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-24 md:py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/product-resonator.png')] opacity-10 object-cover object-center mix-blend-screen" />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Frequency Control Solutions</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Ultra-stable, highly reliable components engineered for mission-critical applications.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Cpu className="w-8 h-8 text-primary" />,
                title: "Crystal Oscillators",
                desc: "High-precision SPXO, TCXO, VCXO, and OCXO modules providing unmatched stability across extreme temperature ranges."
              },
              {
                icon: <RadioReceiver className="w-8 h-8 text-primary" />,
                title: "Resonators",
                desc: "Miniaturized SMD quartz crystals offering tight tolerances and low ESR for modern compact electronics."
              },
              {
                icon: <Activity className="w-8 h-8 text-primary" />,
                title: "Filters & Timing",
                desc: "Advanced SAW filters and RTC modules designed for superior signal clarity and exact timing synchronization."
              }
            ].map((product, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-md"
              >
                <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mb-6">
                  {product.icon}
                </div>
                <h3 className="text-2xl font-display font-bold mb-4">{product.title}</h3>
                <p className="text-slate-400 leading-relaxed mb-6">
                  {product.desc}
                </p>
                <Link href="#" className="inline-flex items-center text-primary font-medium hover:text-primary/80 transition-colors">
                  View Datasheets <ChevronRight className="ml-1 w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Engineered for Extremes.</h2>
              <p className="text-xl text-muted-foreground">
                Our components are the unseen foundation of technologies that cannot afford to fail.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Automotive", desc: "AEC-Q200 compliant solutions for ADAS and EV." },
              { title: "Telecommunications", desc: "Low phase noise for 5G base stations." },
              { title: "Consumer IoT", desc: "Ultra-miniature components for wearables." },
              { title: "Industrial", desc: "Ruggedized timing for automation." }
            ].map((ind, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group relative p-8 rounded-2xl bg-muted/50 hover:bg-primary transition-colors cursor-default overflow-hidden"
              >
                <div className="relative z-10">
                  <h3 className="text-xl font-bold font-display mb-2 group-hover:text-white transition-colors">{ind.title}</h3>
                  <p className="text-sm text-muted-foreground group-hover:text-white/80 transition-colors">{ind.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality & Supply Chain */}
      <section id="quality" className="py-24 md:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 md:order-1"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-background rounded-xl border border-border shadow-sm">
                  <ShieldCheck className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-bold mb-2">Zero-Defect Policy</h4>
                  <p className="text-sm text-muted-foreground">Automated optical inspection and rigorous environmental testing.</p>
                </div>
                <div className="p-6 bg-background rounded-xl border border-border shadow-sm mt-8">
                  <Globe2 className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-bold mb-2">Global Scale</h4>
                  <p className="text-sm text-muted-foreground">Managed supply network ensuring uninterrupted delivery.</p>
                </div>
                <div className="p-6 bg-background rounded-xl border border-border shadow-sm -mt-8">
                  <Factory className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-bold mb-2">Fabless Agility</h4>
                  <p className="text-sm text-muted-foreground">Focus on R&D while partnering with top-tier foundries.</p>
                </div>
                <div className="p-6 bg-background rounded-xl border border-border shadow-sm">
                  <Activity className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-bold mb-2">ISO Certified</h4>
                  <p className="text-sm text-muted-foreground">Adherence to international automotive and industrial standards.</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 md:order-2"
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Uncompromising Quality Assurance.</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Our fabless model allows us to focus entirely on what matters most: engineering excellence and rigorous quality control. 
              </p>
              <p className="text-lg text-muted-foreground">
                We manage a complex global supply chain, auditing partner facilities continuously to ensure every single component meets our strict zero-defect standards before it reaches our clients.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Ready to Power Your Next Innovation?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Connect with our engineering team to discuss custom frequency control solutions for your specific requirements.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-lg">Contact Engineering</Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-background">Download Product Catalog</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm bg-foreground flex items-center justify-center">
              <Zap className="w-3 h-3 text-background" />
            </div>
            <span className="font-display font-bold tracking-tight">Sunny Electronics</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sunny Electronics. Established 1966.
          </div>
        </div>
      </footer>
    </div>
  );
}
