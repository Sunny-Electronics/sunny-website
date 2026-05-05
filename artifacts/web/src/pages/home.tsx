import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { ChevronRight, Cpu, RadioReceiver, Activity, Globe2, ShieldCheck, ArrowRight, Factory, TrendingUp, Award, Users, LogIn, Search, Upload, FileText, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiSamsung, SiLg, SiGarmin } from "react-icons/si";
import sunnyLogo from "@assets/image_1775118121182.png";
import productsPhoto from "@assets/001_1775118159591.jpg";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 shrink-0">
            <img src={sunnyLogo} alt="Sunny Electronics Corp." className="h-10 w-auto" />
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-lg tracking-tight text-foreground">Sunny Electronics Corp.</span>
              <span className="text-[11px] text-muted-foreground font-medium tracking-wide">KOSPI-listed (KRX: 004770)</span>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 items-center border border-input bg-background lg:max-w-xl">
            <Input
              className="h-11 border-0 bg-transparent focus-visible:ring-0"
              placeholder="Search part #, datasheet, QA document"
              data-testid="input-site-search"
            />
            <Link
              href="/request-quote"
              className="hidden h-11 items-center gap-2 px-3 text-xs font-semibold text-primary md:flex"
              data-testid="link-upload-list"
            >
              <Upload className="h-4 w-4" />
              Upload List
            </Link>
            <Link
              href="/request-quote"
              className="flex h-11 w-12 items-center justify-center bg-primary text-primary-foreground"
              aria-label="Search"
              data-testid="link-site-search"
            >
              <Search className="h-5 w-5" />
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-6 font-medium text-sm text-muted-foreground">
            <a href="#about" className="hover:text-foreground transition-colors" data-testid="link-legacy">Legacy</a>
            <Link href="/products" className="hover:text-foreground transition-colors" data-testid="link-products">Products</Link>
            <a href="#industries" className="hover:text-foreground transition-colors" data-testid="link-industries">Industries</a>
            <a href="#quality" className="hover:text-foreground transition-colors" data-testid="link-quality">Quality</a>
            <Link href="/request-quote" className="text-primary hover:text-primary/80 transition-colors" data-testid="link-request-quote">Request Quote</Link>
            <Link href="/request-access">
              <Button data-testid="button-partners-portal" className="gap-2">
                <LogIn className="w-4 h-4" />
                Partners Portal Log In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative min-h-[90vh] flex items-center pt-40 lg:pt-28 overflow-hidden">
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
              <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
                Sunny Electronics Corp. engineers world-class crystal oscillators, resonators, and filters -- powering the most demanding technologies across automotive, telecommunications, and consumer electronics for nearly six decades.
              </p>
              <p className="text-sm font-semibold tracking-wider text-primary uppercase mb-8">
                Since 1966 &nbsp;|&nbsp; Korea-Based &nbsp;|&nbsp; Global Supply Network
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/request-quote">
                  <Button size="lg" className="h-14 px-8 text-base group" data-testid="button-request-quote-hero">
                    Request a Quote
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-background" data-testid="button-view-products" asChild>
                  <Link href="/products">
                    View Products
                  </Link>
                </Button>
              </div>
              <div className="mt-6 grid max-w-xl gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  RFQ list upload
                </div>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" />
                  Spec search coming
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  QA document support
                </div>
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
              { value: 'KOSPI', label: 'Listed Company (KRX: 004770)', icon: <TrendingUp className="w-5 h-5 text-primary" /> },
              { value: '1966', label: 'Year Established', icon: <Factory className="w-5 h-5 text-primary" /> },
              { value: 'Tier-1', label: 'Trusted by Global Manufacturers', icon: <Users className="w-5 h-5 text-primary" /> }
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
                Sunny Electronics is a Korea-based fabless manufacturer specializing in frequency control solutions, publicly listed on KOSPI (KRX: 004770). With nearly six decades of continuous innovation, we have built a strong reputation for precision, reliability, and long-term supply stability.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Our foundation is built on over 50 years of collaboration with leading Korean companies, including Samsung, LG, and their affiliated partners. These long-standing relationships reflect our ability to consistently meet strict quality, performance, and delivery standards in high-demand industries.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Sunny Electronics operates on a proven fabless model, combining in-house design, strict quality control, and a fully managed global production network. Our accumulated engineering expertise and operational know-how enable us to deliver stable, high-performance components across a wide range of applications.
              </p>
              <div className="grid grid-cols-3 gap-6">
                <div className="p-4 bg-muted/50 rounded-xl text-center">
                  <div className="text-2xl font-display font-bold text-primary mb-1">1966</div>
                  <div className="text-xs font-medium text-muted-foreground">Established</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl text-center">
                  <div className="text-2xl font-display font-bold text-primary mb-1">Tier-1</div>
                  <div className="text-xs font-medium text-muted-foreground">Trusted Global Supplier</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl text-center">
                  <div className="text-2xl font-display font-bold text-primary mb-1">KOSPI</div>
                  <div className="text-xs font-medium text-muted-foreground">Listed (KRX: 004770)</div>
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
                desc: "High-precision SPXO, TCXO, VCXO, and OCXO modules providing unmatched frequency stability across extreme temperature ranges, engineered to meet the stringent requirements of Tier-1 global manufacturers.",
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
                We maintain a fully controlled global supply chain, continuously auditing and optimizing our partner network to ensure consistent quality and reliability. Our zero-defect approach and long-term manufacturing discipline allow us to support customers with stable supply, competitive pricing, and dependable performance.
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
              Connect with our engineering team to discuss custom frequency control solutions tailored to your specific requirements. As a KOSPI-listed company (KRX: 004770), we provide the transparency, stability, and long-term reliability our global partners expect.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/request-quote">
                <Button size="lg" className="h-14 px-8 text-lg" data-testid="button-cta-request-quote">Request Quote</Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-background" data-testid="button-search-products">Search Products</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="request-quote" className="py-24 md:py-32 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold tracking-wider uppercase mb-6">
              RFQ Center
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Products, Quotes, and Documents in One Place.</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              SunnyKR will become the place for customers to search standard products, request pricing, upload RFQ lists, and later find datasheets and QA documents.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold">Search Products</h3>
                  <span className="text-sm text-slate-400">Part number and spec lookup</span>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-300">
                Visitors can search by keyword, part number, frequency, package, or document type. Full search data will be added as we build the catalog.
              </p>
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
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold">Upload RFQ List</h3>
                  <span className="text-sm text-slate-400">Excel, CSV, or PDF request</span>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-300">
                New customers can upload a list and answer a few simple industry-standard questions so Sunny can prepare price, lead time, and document support.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <History className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold">Quote History</h3>
                  <span className="text-sm text-slate-400">Customer portal later</span>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-300">
                Instead of a shopping cart, SunnyKR will focus on quote history, RFQ status, PO status, and customer-specific records.
              </p>
            </motion.div>
          </div>

          <div className="text-center">
            <Link href="/request-quote">
              <Button size="lg" className="h-14 px-8 text-lg" data-testid="button-bottom-request-quote">
                Request a Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
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
                <span className="text-[10px] text-slate-400">KOSPI-listed (KRX: 004770)</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <Link href="/products" className="hover:text-white transition-colors">Products</Link>
              <a href="#industries" className="hover:text-white transition-colors">Industries</a>
              <a href="#quality" className="hover:text-white transition-colors">Quality</a>
              <Link href="/request-quote" className="hover:text-white transition-colors">Request Quote</Link>
            </div>
            <div className="text-sm text-slate-400 text-center md:text-right">
              <div>&copy; {new Date().getFullYear()} Sunny Electronics Corp.</div>
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
