import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Mail, Instagram, Twitter, Linkedin, Github } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const PROJECTS = [
  {
    slug: "editorial-archive",
    title: "The Editorial Archive",
    role: "Art Direction & Design",
    year: "2023",
    description: "A comprehensive digital archive for a leading fashion publication, translating print typography into a fluid web experience.",
    image: `${import.meta.env.BASE_URL}images/project-1.png`
  },
  {
    slug: "atelier-stationery",
    title: "Atelier Identity",
    role: "Brand Identity",
    year: "2023",
    description: "Complete visual identity and physical collateral for an architectural firm based in Copenhagen.",
    image: `${import.meta.env.BASE_URL}images/project-2.png`
  },
  {
    slug: "nexus-app",
    title: "Nexus Platform",
    role: "Product Design",
    year: "2022",
    description: "A dark-mode first financial analytics platform designed for high-frequency trading firms.",
    image: `${import.meta.env.BASE_URL}images/project-3.png`
  },
  {
    slug: "aura-botanicals",
    title: "Aura Botanicals",
    role: "Packaging & Brand",
    year: "2022",
    description: "Sustainable packaging design and visual system for an organic skincare line.",
    image: `${import.meta.env.BASE_URL}images/project-4.png`
  }
];

export function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full p-6 md:p-10 z-50 mix-blend-difference text-white flex justify-between items-center pointer-events-none">
        <Link href="/" className="font-serif text-xl tracking-tight pointer-events-auto">A. Rivera</Link>
        <div className="flex gap-6 text-sm font-medium tracking-wide uppercase pointer-events-auto">
          <a href="#work" className="hover:opacity-70 transition-opacity">Work</a>
          <a href="#about" className="hover:opacity-70 transition-opacity">About</a>
          <a href="#contact" className="hover:opacity-70 transition-opacity">Contact</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-end p-6 md:p-12 lg:p-24 pt-32">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl z-10"
        >
          <h1 className="font-serif font-bold text-7xl md:text-9xl lg:text-[12rem] leading-[0.95] tracking-tight mb-6">
            aadiilin
          </h1>
          <p className="text-xl md:text-2xl text-white max-w-2xl font-light leading-relaxed">
            Adil Sarvadka|Media production & graphic designer
          </p>
        </motion.div>
        
        {/* Abstract shape/image in background */}
        <motion.div 
          style={{ y }}
          className="absolute top-1/4 right-10 w-1/2 md:w-1/3 aspect-[3/4] opacity-20 md:opacity-40"
        >
          <img src={`${import.meta.env.BASE_URL}images/avatar.png`} alt="Alex Rivera" className="w-full h-full object-cover object-center filter grayscale contrast-125" />
        </motion.div>
      </section>

      {/* Work Showcase */}
      <section id="work" className="py-24 md:py-32 px-6 md:px-12 lg:px-24">
        <div className="mb-16 md:mb-24 flex items-baseline justify-between border-b border-border pb-6">
          <h2 className="font-serif text-3xl md:text-5xl">Selected Works</h2>
          <span className="text-sm uppercase tracking-widest text-muted-foreground">(04)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-x-16 md:gap-y-32">
          {PROJECTS.map((project, i) => (
            <motion.div 
              key={project.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i % 2 === 0 ? 0 : 0.2 }}
              className={`group flex flex-col ${i % 2 !== 0 ? 'md:mt-32' : ''}`}
            >
              <Link href={`/work/${project.slug}`} className="block overflow-hidden relative aspect-[4/3] mb-6 cursor-pointer">
                <div className="absolute inset-0 bg-black/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <span className="text-white border border-white/30 rounded-full px-6 py-3 backdrop-blur-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    View Case Study <ArrowRight size={16} />
                  </span>
                </div>
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
              </Link>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-2xl mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="text-muted-foreground text-sm uppercase tracking-wider">{project.role}</p>
                </div>
                <span className="text-sm font-serif italic text-muted-foreground">{project.year}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 md:py-32 bg-foreground text-background">
        <div className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
            <div className="lg:col-span-5 relative aspect-[3/4]">
              <img src={`${import.meta.env.BASE_URL}images/avatar.png`} alt="Alex Rivera" className="w-full h-full object-cover" />
            </div>
            
            <div className="lg:col-span-7">
              <h2 className="font-serif text-4xl md:text-6xl mb-8">A relentless pursuit of the intentional.</h2>
              <div className="space-y-6 text-lg md:text-xl font-light text-background/80 leading-relaxed">
                <p>
                  I believe the best digital experiences don't feel like software—they feel like environments. My approach is rooted in traditional editorial design and brutalist architecture, brought to life through modern web technologies.
                </p>
                <p>
                  Over the past decade, I've partnered with visionary founders, fashion houses, and cultural institutions to build brands and digital products that refuse to be ignored.
                </p>
              </div>

              <div className="mt-16 grid grid-cols-2 gap-8 pt-8 border-t border-background/20">
                <div>
                  <h4 className="text-sm uppercase tracking-widest text-background/50 mb-4">Capabilities</h4>
                  <ul className="space-y-2 font-serif text-lg italic">
                    <li>Art Direction</li>
                    <li>Brand Identity</li>
                    <li>Product Design</li>
                    <li>Creative Strategy</li>
                    <li>Web Experiences</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm uppercase tracking-widest text-background/50 mb-4">Select Clients</h4>
                  <ul className="space-y-2 font-serif text-lg italic text-background/80">
                    <li>Vogue Archive</li>
                    <li>Studio OMA</li>
                    <li>Aura Botanicals</li>
                    <li>Polestar</li>
                    <li>Acme Corp</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 md:py-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-4xl md:text-7xl mb-6 text-center">Let's create something memorable.</h2>
          <p className="text-center text-muted-foreground mb-16 max-w-lg mx-auto">
            Currently accepting select projects for Q4 2024. Reach out to discuss how we can collaborate.
          </p>

          <form 
            className="space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Inquiry sent successfully. I'll be in touch soon.");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm uppercase tracking-widest text-muted-foreground">Name</label>
                <Input required className="border-0 border-b border-border rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-primary text-lg bg-transparent" placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm uppercase tracking-widest text-muted-foreground">Email</label>
                <Input required type="email" className="border-0 border-b border-border rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-primary text-lg bg-transparent" placeholder="jane@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm uppercase tracking-widest text-muted-foreground">Project Details</label>
              <Textarea required className="border-0 border-b border-border rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-primary text-lg min-h-[150px] resize-none bg-transparent" placeholder="Tell me about what you're building..." />
            </div>
            <div className="flex justify-center pt-8">
              <button type="submit" className="group relative inline-flex items-center justify-center px-8 py-4 bg-foreground text-background font-medium uppercase tracking-widest text-sm overflow-hidden transition-all hover:bg-primary">
                <span className="relative z-10 flex items-center gap-2">Send Inquiry <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 lg:px-24 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-serif text-2xl italic">Alex Rivera</div>
        <div className="flex gap-6">
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Instagram size={20} /></a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Twitter size={20} /></a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Linkedin size={20} /></a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Github size={20} /></a>
        </div>
        <div className="text-sm text-muted-foreground uppercase tracking-widest">
          © {new Date().getFullYear()} All Rights Reserved
        </div>
      </footer>
    </div>
  );
}
