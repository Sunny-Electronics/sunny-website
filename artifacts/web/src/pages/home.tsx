import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { ChevronRight, Cpu, RadioReceiver, Activity, Globe2, ShieldCheck, ArrowRight, Factory, TrendingUp, Award, Users, LogIn, MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiSamsung, SiLg, SiGarmin } from "react-icons/si";
import sunnyLogo from "@assets/image_1775118121182.png";
import productsPhoto from "@assets/001_1775118159591.jpg";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={sunnyLogo} alt="Sunny Electronics Corp." className="h-10 w-auto" />
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-lg tracking-tight text-foreground">Sunny Electronics Corp.</span>
              <span className="text-[11px] text-muted-foreground font-medium tracking-wide">KRX: 004770</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-muted-foreground">
            <a href="#about" className="hover:text-foreground transition-colors" data-testid="link-legacy">Legacy</a>
            <a href="#products" className="hover:text-foreground transition-colors" data-testid="link-solutions">Solutions</a>
            <a href="#industries" className="hover:text-foreground transition-colors" data-testid="link-industries">Industries</a>
            <a href="#quality" className="hover:text-foreground transition-colors" data-testid="link-quality">Quality</a>
            <a href="#contact" className="hover:text-foreground transition-colors" data-testid="link-contact">Contact</a>
            <Button data-testid="button-partners-portal" className="gap-2">
              <LogIn className="w-4 h-4" />
              Partners Portal Log In
            </Button>
          </div>
        </div>
      </nav>

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
              <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight leading-[1.1] mb-6">
                The Heartbeat of <br/>
                <span className="text-primary">Global Innovation.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Sunny Electronics Corp. engineers world-class crystal oscillators, resonators, and filters -- powering the most demanding technologies across automotive, telecommunications, and consumer electronics for nearly six decades.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="h-14 px-8 text-base group" data-testid="button-explore-solutions">
                  Explore Solutions
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base" data-testid="button-view-specs">
                  View Specifications
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-8 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px flex-1 bg-border" />
            <p className="text-xs font-semibold text-muted-foreground tracking-[0.2em] uppercase whitespace-nowrap">
              Trusted by Global Industry Leaders
            </p>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
            <div className="flex items-center gap-2.5 opacity-50 hover:opacity-100 transition-opacity duration-300">
              <SiLg className="w-8 h-8 text-foreground" />
              <div>
                <div className="text-base font-display font-bold text-foreground leading-tight">LG</div>
                <div className="text-[10px] text-muted-foreground tracking-wider uppercase">Electronics</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 opacity-50 hover:opacity-100 transition-opacity duration-300">
              <SiSamsung className="w-10 h-8 text-foreground" />
              <div>
                <div className="text-base font-display font-bold text-foreground leading-tight">Samsung</div>
                <div className="text-[10px] text-muted-foreground tracking-wider uppercase">Electronics</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 opacity-50 hover:opacity-100 transition-opacity duration-300">
              <SiGarmin className="w-7 h-7 text-foreground" />
              <div>
                <div className="text-base font-display font-bold text-foreground leading-tight">Garmin</div>
                <div className="text-[10px] text-muted-foreground tracking-wider uppercase">International</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 opacity-50 hover:opacity-100 transition-opacity duration-300">
              <Factory className="w-6 h-6 text-foreground" />
              <div>
                <div className="text-base font-display font-bold text-foreground leading-tight">Foxconn</div>
                <div className="text-[10px] text-muted-foreground tracking-wider uppercase">Technology</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 opacity-50 hover:opacity-100 transition-opacity duration-300">
              <Globe2 className="w-6 h-6 text-foreground" />
              <div>
                <div className="text-base font-display font-bold text-foreground leading-tight">Flex</div>
                <div className="text-[10px] text-muted-foreground tracking-wider uppercase">Ltd.</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 opacity-50 hover:opacity-100 transition-opacity duration-300">
              <Cpu className="w-6 h-6 text-foreground" />
              <div>
                <div className="text-base font-display font-bold text-foreground leading-tight">Jabil</div>
                <div className="text-[10px] text-muted-foreground tracking-wider uppercase">Inc.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: '58+', label: 'Years of Excellence', icon: <Award className="w-5 h-5 text-primary" /> },
              { value: 'KRX', label: '004770 (Publicly Traded)', icon: <TrendingUp className="w-5 h-5 text-primary" /> },
              { value: '1966', label: 'Year Established', icon: <Factory className="w-5 h-5 text-primary" /> },
              { value: 'Global', label: 'Supply Chain Network', icon: <Users className="w-5 h-5 text-primary" /> }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-6">
                Our Heritage
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Nearly Six Decades of Uncompromising Precision.</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Established in 1966 in Korea, Sunny Electronics Corp. has evolved from a pioneering domestic manufacturer to a publicly traded global fabless semiconductor leader (KRX: 004770). Our commitment to frequency control technology spans nearly six decades of continuous innovation.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Like industry peers such as Epson Timing and NDK, we operate on a highly efficient fabless model -- investing heavily in R&D and strict quality assurance while leveraging a fully managed global supply chain to deliver scalability without sacrificing the precision our partners demand.
              </p>
              <div className="grid grid-cols-3 gap-6">
                <div className="p-4 bg-muted/50 rounded-xl text-center">
                  <div className="text-2xl font-display font-bold text-primary mb-1">1966</div>
                  <div className="text-xs font-medium text-muted-foreground">Established</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl text-center">
                  <div className="text-2xl font-display font-bold text-primary mb-1">Tier-1</div>
                  <div className="text-xs font-medium text-muted-foreground">Global Supplier</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl text-center">
                  <div className="text-2xl font-display font-bold text-primary mb-1">KRX</div>
                  <div className="text-xs font-medium text-muted-foreground">Publicly Traded</div>
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
              <img src="/lab-rd.png" alt="Sunny Electronics Corp. R&D Laboratory" className="w-full h-full object-cover" />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden bg-white shadow-lg"
            >
              <img src={productsPhoto} alt="Sunny Electronics Corp. Product Portfolio - Crystal Oscillators, Resonators, and Filters" className="w-full h-auto" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-6">
                Product Portfolio
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Comprehensive Frequency Control Solutions</h2>
              <p className="text-lg text-muted-foreground mb-6">
                From ultra-miniature SMD crystals to high-stability oven-controlled oscillators, our product range covers the full spectrum of frequency control needs. Each component is engineered to deliver consistent performance across the most demanding operating conditions.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Crystal Units (MHz / kHz range)</span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>SPXO, TCXO, VCXO, OCXO Oscillators</span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>SAW Filters and RTC Modules</span>
                </li>
                <li className="flex items-start gap-3">
                  <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Custom Frequency Solutions and Engineering Support</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="products" className="py-24 md:py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/product-resonator.png')] opacity-10 object-cover object-center mix-blend-screen" />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-wider uppercase mb-6">
              Engineering Excellence
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Frequency Control Solutions</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Ultra-stable, highly reliable components engineered for mission-critical applications -- from 5G infrastructure to automotive ADAS systems.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Cpu className="w-8 h-8 text-primary" />,
                title: "Crystal Oscillators",
                desc: "High-precision SPXO, TCXO, VCXO, and OCXO modules providing unmatched frequency stability across extreme temperature ranges. Comparable to solutions from Epson Timing and NDK.",
                specs: "Frequency Range: 1MHz - 200MHz"
              },
              {
                icon: <RadioReceiver className="w-8 h-8 text-primary" />,
                title: "Quartz Resonators",
                desc: "Miniaturized SMD quartz crystals offering tight frequency tolerances and low ESR, designed for modern compact electronics and IoT applications.",
                specs: "Package Sizes: 1.2x1.0mm to 7.0x5.0mm"
              },
              {
                icon: <Activity className="w-8 h-8 text-primary" />,
                title: "Filters & Timing Modules",
                desc: "Advanced SAW filters and RTC modules designed for superior signal clarity and precise timing synchronization in telecommunications and industrial systems.",
                specs: "Temperature Range: -40C to +125C"
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
                <p className="text-slate-400 leading-relaxed mb-4">
                  {product.desc}
                </p>
                <div className="text-xs font-mono text-primary/80 bg-primary/10 px-3 py-1.5 rounded-md inline-block mb-6">
                  {product.specs}
                </div>
                <div className="block">
                  <Link href="#" className="inline-flex items-center text-primary font-medium hover:text-primary/80 transition-colors">
                    View Datasheets <ChevronRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="industries" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-6">
                Applications
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Engineered for Extremes.</h2>
              <p className="text-xl text-muted-foreground">
                Our components are the unseen foundation of technologies that cannot afford to fail. From automotive safety systems to telecommunications infrastructure.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Automotive", desc: "AEC-Q200 compliant solutions for ADAS, infotainment, and EV powertrain systems. Partnering with Tier-1 automotive suppliers worldwide." },
              { title: "Telecommunications", desc: "Low phase noise oscillators for 5G base stations, network infrastructure, and fiber optic systems requiring precise timing." },
              { title: "Consumer & IoT", desc: "Ultra-miniature components for wearables, smart home devices, and connected sensors. Trusted by leading consumer brands." },
              { title: "Industrial & Medical", desc: "Ruggedized timing solutions for industrial automation, medical devices, and defense applications requiring extreme reliability." }
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
                  <h3 className="text-xl font-bold font-display mb-3 group-hover:text-white transition-colors">{ind.title}</h3>
                  <p className="text-sm text-muted-foreground group-hover:text-white/80 transition-colors leading-relaxed">{ind.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
                  <p className="text-sm text-muted-foreground">Automated optical inspection and rigorous environmental testing at every production stage.</p>
                </div>
                <div className="p-6 bg-background rounded-xl border border-border shadow-sm mt-8">
                  <Globe2 className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-bold mb-2">Global Supply Chain</h4>
                  <p className="text-sm text-muted-foreground">Fully managed supply network ensuring uninterrupted delivery to partners worldwide.</p>
                </div>
                <div className="p-6 bg-background rounded-xl border border-border shadow-sm -mt-8">
                  <Factory className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-bold mb-2">Fabless Agility</h4>
                  <p className="text-sm text-muted-foreground">R&D focused model partnering with top-tier foundries for manufacturing excellence.</p>
                </div>
                <div className="p-6 bg-background rounded-xl border border-border shadow-sm">
                  <Award className="w-8 h-8 text-primary mb-4" />
                  <h4 className="font-bold mb-2">Certified Quality</h4>
                  <p className="text-sm text-muted-foreground">ISO 9001, IATF 16949, and AEC-Q200 compliance across all product lines.</p>
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-6">
                Quality Assurance
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Uncompromising Quality Standards.</h2>
              <p className="text-lg text-muted-foreground mb-6">
                At Sunny Electronics Corp., our fabless model allows us to focus entirely on what matters most: engineering excellence and rigorous quality control. Every component undergoes comprehensive testing before shipment.
              </p>
              <p className="text-lg text-muted-foreground">
                We manage a complex global supply chain, continuously auditing partner facilities to ensure every single component meets our strict zero-defect standards -- matching the quality benchmarks set by industry leaders like Epson and Kyocera.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Ready to Power Your Next Innovation?</h2>
            <p className="text-xl text-muted-foreground mb-10">
              Connect with our engineering team to discuss custom frequency control solutions tailored to your specific requirements. As a publicly traded company (KRX: 004770), we offer the stability and transparency our partners expect.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-lg" data-testid="button-contact-engineering">Contact Engineering</Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-background" data-testid="button-download-catalog">Download Product Catalog</Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="contact" className="py-24 md:py-32 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-wider uppercase mb-6">
              Get in Touch
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Contact Us</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Reach out to our team at either of our locations in South Korea. We look forward to discussing how we can support your next project.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold">Seoul Office</h3>
                  <span className="text-sm text-slate-400">Headquarters</span>
                </div>
              </div>
              <div className="space-y-4 text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                  <span>GFC Building, Seoul, South Korea</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <a href="mailto:info@sunnykr.com" className="hover:text-primary transition-colors">info@sunnykr.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <a href="https://www.sunnykr.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">www.sunnykr.com</a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Factory className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold">Chungju Office</h3>
                  <span className="text-sm text-slate-400">Operations</span>
                </div>
              </div>
              <div className="space-y-4 text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
                  <span>Chungju, Chungcheongbuk-do, South Korea</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <a href="mailto:info@sunnykr.com" className="hover:text-primary transition-colors">info@sunnykr.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <a href="https://www.sunnykr.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">www.sunnykr.com</a>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="text-center">
            <Button size="lg" className="h-14 px-8 text-lg" data-testid="button-send-inquiry">
              <Mail className="w-5 h-5 mr-2" />
              Send an Inquiry
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={sunnyLogo} alt="Sunny Electronics Corp." className="h-8 w-auto" />
              <div className="flex flex-col leading-tight">
                <span className="font-display font-bold tracking-tight">Sunny Electronics Corp.</span>
                <span className="text-[10px] text-slate-400">KRX: 004770</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#products" className="hover:text-white transition-colors">Products</a>
              <a href="#industries" className="hover:text-white transition-colors">Industries</a>
              <a href="#quality" className="hover:text-white transition-colors">Quality</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="text-sm text-slate-400 text-center md:text-right">
              <div>© {new Date().getFullYear()} Sunny Electronics Corp.</div>
              <div className="text-xs mt-1">Established 1966 | Seoul, Korea |{" "}
                <a href="https://www.sunnykr.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">sunnykr.com</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
