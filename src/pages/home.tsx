import { Link } from "wouter";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Mail, Instagram, Linkedin, Github, Menu, X, Maximize2 } from "lucide-react";
import { FaWhatsapp, FaPinterest } from "react-icons/fa";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ShadowOverlay } from "@/components/ui/shadow-overlay";
import { OpeningLoader } from "@/components/ui/opening-loader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PROJECTS = [
  {
    slug: "imbizo",
    title: "IMBIZO 1.0",
    role: "Poster & Identity",
    year: "2025",
    description: "Poster and identity for IMBIZO 1.0, an arts fest hosted by Baithul Izza celebrating freedom of survival and existence through bold typography and modular geometric motifs.",
    image: `${import.meta.env.BASE_URL}images/imbizo.jpeg`
  },
  {
    slug: "an-nur",
    title: "An-Nur Fifteen Hundred",
    role: "Campaign Design",
    year: "2025",
    description: "Commemorative campaign poster for An-Nur 1500, marking the 1500th Mawlid al-Nabi with elegant typography, devotional motifs, and architectural photography.",
    image: `${import.meta.env.BASE_URL}images/annur.jpeg`
  },
  {
    slug: "hijra",
    title: "Hijra Talk Series",
    role: "Event Identity",
    year: "2025",
    description: "Identity and announcement layout for the Hijra Talk Series under the Muharram campaign, blending modern type with calligraphic accents.",
    image: `${import.meta.env.BASE_URL}images/hijra.jpeg`
  },
  {
    slug: "keam-2025",
    title: "KEAM 2025 Results",
    role: "Editorial Layout",
    year: "2025",
    description: "Results announcement design for Science Orbit at Baithul Izza, celebrating top KEAM ranks with bold portraits and a structured grid.",
    image: `${import.meta.env.BASE_URL}images/keam.jpeg`
  },
  {
    slug: "enroute",
    title: "Enroute",
    role: "Travel Campaign",
    year: "2024",
    description: "Visual campaign for Enroute, a Kerala–Karnataka–Tamil Nadu trip, mixing photography with map UI elements and editorial typography.",
    image: `${import.meta.env.BASE_URL}images/enroute.jpeg`
  },
  {
    slug: "guest-welcome",
    title: "Hearty Welcomes",
    role: "Event Poster",
    year: "2024",
    description: "Chief guest welcome poster for the Kashmiri Sadath Uroos Mubarak & Milad Sangamam, designed with warm earthy tones and layered typography.",
    image: `${import.meta.env.BASE_URL}images/guest.jpeg`
  }
];

export function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const [selectedProject, setSelectedProject] = useState<typeof PROJECTS[0] | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Lightbox */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-background/95 backdrop-blur-xl cursor-zoom-out"
            />
            
            <motion.div
              layoutId={selectedProject.slug}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl aspect-[4/3] md:aspect-video glass-card rounded-[2rem] overflow-hidden shadow-2xl z-10"
            >
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 z-20 glass p-3 rounded-full hover:scale-110 transition-transform group"
              >
                <X size={20} className="text-primary group-hover:rotate-90 transition-transform" />
              </button>
              
              <img 
                src={selectedProject.image} 
                alt={selectedProject.title} 
                className="w-full h-full object-contain bg-black/20"
              />
              
              <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 bg-gradient-to-t from-black/80 to-transparent">
                <h2 className="font-title font-extrabold text-3xl md:text-5xl text-white mb-2">{selectedProject.title}</h2>
                <div className="flex items-center gap-4">
                  <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs">{selectedProject.role}</span>
                  <span className="w-1 h-1 bg-white/30 rounded-full" />
                  <span className="text-white/50 font-title text-sm">{selectedProject.year}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background orbs removed for performance */}
      <ShadowOverlay 
        color="rgba(255, 190, 0, 0.06)" 
        animation={{ scale: 40, speed: 12 }} 
        noise={{ opacity: 0.04, scale: 0.5 }}
        className="fixed inset-0 z-0 pointer-events-none"
      />

      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50">
        <div className="glass px-5 py-2 rounded-full flex justify-between items-center">
          <Link href="/" className="font-title font-extrabold text-base md:text-lg tracking-tight text-foreground hover:text-primary transition-colors">Adil.S</Link>
          
          <div className="flex items-center gap-4">
            {/* Social Icons */}
            <div className="hidden sm:flex items-center gap-4 mr-2 border-r border-white/10 pr-4">
              <a href="https://www.instagram.com/aadiil.in?utm_source=qr&igsh=bHIzNTl0bXFkeG85" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={14} /></a>
              <a href="https://wa.me/918137802554" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><FaWhatsapp size={14} /></a>
              <a href="https://www.linkedin.com/in/adil-sarvadka-51282a406?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin size={14} /></a>
            </div>

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors outline-none group">
                  <Menu size={16} className="text-primary group-hover:rotate-90 transition-transform duration-300" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Menu</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass border-white/10 mt-2 min-w-[140px] rounded-2xl overflow-hidden p-1 shadow-2xl">
                <motion.div
                  initial="closed"
                  animate="open"
                  variants={{
                    open: {
                      transition: { staggerChildren: 0.05, delayChildren: 0.05 }
                    },
                    closed: {
                      transition: { staggerChildren: 0.05, staggerDirection: -1 }
                    }
                  }}
                >
                  {[
                    { label: "Work", href: "#work" },
                    { label: "About", href: "#about" },
                    { label: "Contact", href: "#contact" }
                  ].map((item) => (
                    <DropdownMenuItem key={item.label} asChild>
                      <motion.a
                        href={item.href}
                        variants={{
                          open: { opacity: 1, x: 0 },
                          closed: { opacity: 0, x: 10 }
                        }}
                        className="text-[10px] font-bold tracking-[0.2em] uppercase cursor-pointer py-3 px-4 hover:bg-white/5 focus:bg-white/5 transition-colors block"
                      >
                        {item.label}
                      </motion.a>
                    </DropdownMenuItem>
                  ))}
                  
                  <motion.div 
                    variants={{
                      open: { opacity: 1, y: 0 },
                      closed: { opacity: 0, y: 10 }
                    }}
                    className="sm:hidden border-t border-white/5 mt-1 pt-1 flex justify-around py-3"
                  >
                    <a href="https://www.instagram.com/aadiil.in?utm_source=qr&igsh=bHIzNTl0bXFkeG85" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={14} /></a>
                    <a href="https://wa.me/918137802554" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><FaWhatsapp size={14} /></a>
                    <a href="https://www.linkedin.com/in/adil-sarvadka-51282a406?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin size={14} /></a>
                  </motion.div>
                </motion.div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden z-10">
        <div className="relative z-10 text-center max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <h1 className="font-serif font-bold text-7xl md:text-9xl lg:text-[14rem] leading-[0.95] tracking-tight mb-2 text-foreground drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
              aadiilin
            </h1>
            <div className="h-1 w-24 bg-primary mx-auto rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-base md:text-xl tracking-[0.4em] uppercase text-muted-foreground mb-12"
          >
            Freelance Graphic Designer
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <a 
              href="#work" 
              className="glossy-button px-10 py-5 rounded-full inline-flex items-center gap-3 text-sm font-bold tracking-widest uppercase text-foreground hover:scale-105 transition-transform"
            >
              Explore Portfolio <ArrowRight size={18} className="text-primary" />
            </a>
          </motion.div>
        </div>
        
        {/* Floating decorative elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-12 h-12 glass rounded-xl rotate-12 opacity-40 hidden md:block"
        />
        <motion.div
          animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-20 h-20 glass rounded-full opacity-30 hidden md:block"
        />
      </section>

      {/* Work Showcase */}
      <section id="work" className="py-24 md:py-32 px-6 md:px-12 lg:px-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 md:mb-24 flex items-baseline justify-between border-b border-white/10 pb-6"
        >
          <h2 className="font-serif text-3xl md:text-5xl">Selected Works</h2>
          <span className="text-sm uppercase tracking-widest text-muted-foreground">(06)</span>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-12 gap-4 md:gap-10">
          {PROJECTS.map((project, i) => {
            // Define different grid spans for a "realistic bento flow" on both mobile (2 cols) and desktop (12 cols)
            const spans = [
              "col-span-2 md:col-span-7", // 1. Large
              "col-span-1 md:col-span-5", // 2. Small
              "col-span-1 md:col-span-5", // 3. Small
              "col-span-2 md:col-span-7", // 4. Large
              "col-span-1 md:col-span-6", // 5. Medium
              "col-span-1 md:col-span-6", // 6. Medium
            ];
            const aspectRatios = [
              "aspect-[16/10] md:aspect-[16/10]",
              "aspect-square md:aspect-[4/5]",
              "aspect-square md:aspect-square",
              "aspect-video md:aspect-[16/9]",
              "aspect-square md:aspect-video",
              "aspect-square md:aspect-video",
            ];
            
            return (
              <motion.div 
                key={project.slug}
                layoutId={project.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className={`group flex flex-col ${spans[i] || "col-span-1 md:col-span-6"}`}
              >
                <button 
                  onClick={() => setSelectedProject(project)}
                  className={`block glass-card overflow-hidden relative ${aspectRatios[i] || "aspect-video"} mb-3 md:mb-6 cursor-zoom-in rounded-2xl md:rounded-[2rem] group text-left w-full outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                >
                  <div className="absolute inset-0 bg-primary/5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="glass px-4 py-2 md:px-6 md:py-3 rounded-full flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 font-bold tracking-[0.2em] uppercase text-[8px] md:text-[10px]">
                      Enlarge <Maximize2 size={12} className="text-primary" />
                    </span>
                  </div>
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-1 md:px-4 gap-1 md:gap-0">
                  <div>
                    <h3 className="font-title font-extrabold text-sm md:text-xl group-hover:text-primary transition-colors line-clamp-1">{project.title}</h3>
                    <p className="text-muted-foreground text-[8px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em] font-bold">{project.role}</p>
                  </div>
                  <span className="hidden md:block text-[10px] font-title font-bold text-muted-foreground bg-white/5 px-4 py-1.5 rounded-full border border-white/5">{project.year}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 md:py-32 relative z-10">
        <div className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
          <div className="glass-card rounded-[2rem] p-8 md:p-16 lg:p-24 overflow-hidden relative">
            {/* Subtle internal glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center relative z-10">
              <div className="lg:col-span-5 relative aspect-[3/4] glass-card rounded-2xl p-2">
                <img 
                  src={`${import.meta.env.BASE_URL}images/adil-portrait.png`} 
                  alt="Aadiilin (Adil Sarvadka) — Freelance Graphic Designer Portrait" 
                  className="w-full h-full object-cover rounded-xl shadow-2xl" 
                />
              </div>
              
              <motion.div
                className="lg:col-span-7"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 className="font-serif text-4xl md:text-6xl mb-8 leading-tight">Hi, I’m <span className="text-primary italic">Aadiilin</span> — a freelance graphic designer.</h2>
                <div className="space-y-8 text-lg md:text-xl font-light text-foreground/80 leading-relaxed">
                  <p>
                    I am a freelance graphic designer focused on creating bold, modern, and visually compelling designs. I bridge the gap between artistic vision and technical execution.
                  </p>
                  
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Design Philosophy</h4>
                    <p className="text-base md:text-lg italic border-l-2 border-primary/30 pl-6">
                      "Design is not just what it looks like and feels like. Design is how it works. My goal is to build visual systems that are as functional as they are beautiful."
                    </p>
                  </div>
                  
                  <p>
                    My approach combines a passion for precise, high-end production with a structured, project-oriented mindset, ensuring every concept is strategically built for impact.
                  </p>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-primary mb-8 font-bold">Expertise & Capabilities</h4>
                  <div className="flex flex-wrap gap-3">
                    {[
                      "Art Direction", "Brand Identity", "Product Design", 
                      "Web Experiences", "Visual Storytelling", "Editorial Layout",
                      "Typography", "Motion Graphics", "Packaging Design", "Creative Strategy"
                    ].map((skill) => (
                      <span key={skill} className="glass px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase border-white/5 hover:border-primary/30 transition-colors">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 md:py-32 px-6 md:px-12 lg:px-24 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="font-serif text-5xl md:text-8xl mb-8 tracking-tighter">Let's create something <span className="italic text-primary">memorable</span>.</h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Currently accepting select projects. Reach out to discuss how we can collaborate.
            </p>
          </motion.div>

          <div className="glass-card rounded-[2.5rem] p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
              <div className="space-y-3">
                <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Email</div>
                <a href="mailto:adilsarvadka@gmail.com" className="block text-base hover:text-primary transition-colors break-all font-medium">
                  adilsarvadka@gmail.com
                </a>
              </div>
              <div className="space-y-3">
                <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Phone</div>
                <a href="tel:+918137802554" className="block text-base hover:text-primary transition-colors font-medium">
                  +91 81378 02554
                </a>
              </div>
              <div className="space-y-3">
                <div className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Address</div>
                <p className="text-base font-medium">Calicut, Kerala, India — 673583</p>
              </div>
            </div>

            <form 
              className="space-y-10"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get("name") as string;
                const email = formData.get("email") as string;
                const details = formData.get("details") as string;
                
                const message = `*Project Inquiry*%0A%0A*Name:* ${name}%0A*Email:* ${email}%0A*Details:* ${details}`;
                window.open(`https://wa.me/918137802554?text=${message}`, '_blank');
                
                toast.success("Opening WhatsApp for inquiry...");
                (e.target as HTMLFormElement).reset();
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Name</label>
                  <Input name="name" required className="recessed-input border-0 rounded-xl px-6 py-7 focus-visible:ring-1 focus-visible:ring-primary/30 text-base placeholder:text-muted-foreground/30" placeholder="Jane Doe" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Email</label>
                  <Input name="email" required type="email" className="recessed-input border-0 rounded-xl px-6 py-7 focus-visible:ring-1 focus-visible:ring-primary/30 text-base placeholder:text-muted-foreground/30" placeholder="jane@example.com" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Project Details</label>
                <Textarea name="details" required className="recessed-input border-0 rounded-xl px-6 py-4 focus-visible:ring-1 focus-visible:ring-primary/30 text-base min-h-[180px] resize-none placeholder:text-muted-foreground/30" placeholder="Tell me about what you're building..." />
              </div>
              <div className="flex justify-center">
                <button type="submit" className="glossy-button group px-12 py-5 rounded-full text-xs font-bold uppercase tracking-[0.3em] text-foreground hover:scale-105 transition-all">
                  <span className="flex items-center gap-3">Send Inquiry <ArrowRight size={16} className="text-primary group-hover:translate-x-1 transition-transform" /></span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 md:px-12 lg:px-24 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10 bg-background/50 backdrop-blur-sm">
        <div className="font-title text-3xl font-extrabold italic text-primary lowercase">aadiilin</div>
        <div className="flex gap-8">
          <a href="https://www.instagram.com/aadiil.in?utm_source=qr&igsh=bHIzNTl0bXFkeG85" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-all hover:scale-110"><Instagram size={20} /></a>
          <a href="https://in.pinterest.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-all hover:scale-110"><FaPinterest size={20} /></a>
          <a href="https://www.linkedin.com/in/adil-sarvadka-51282a406?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-all hover:scale-110"><Linkedin size={20} /></a>
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-all hover:scale-110"><Github size={20} /></a>
        </div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold text-center md:text-right">
          <div>© {new Date().getFullYear()} — Built with Intention</div>
          <div className="mt-2 text-[8px] opacity-60 tracking-[0.15em]">
            With the collaboration from <a href="https://qorvode.co.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline transition-all">qorvode.ai</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
