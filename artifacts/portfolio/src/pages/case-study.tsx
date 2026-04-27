import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useEffect } from "react";

// Mock data (in a real app, this might come from an API or CMS)
const PROJECTS_DATA: Record<string, any> = {
  "editorial-archive": {
    title: "The Editorial Archive",
    role: "Art Direction & Design",
    year: "2023",
    client: "Vogue",
    duration: "4 Months",
    heroImage: `${import.meta.env.BASE_URL}images/project-1-hero.png`,
    images: [`${import.meta.env.BASE_URL}images/project-1.png`, `${import.meta.env.BASE_URL}images/project-2.png`],
    overview: "The Editorial Archive is a comprehensive digital repository that reimagines how fashion history is consumed online. The challenge was to translate the tactile, typographic richness of print magazines into a fluid, highly performant web experience.",
    challenge: "Fashion archives are traditionally clunky and difficult to navigate. The client needed a platform that felt as luxurious as their print publications while handling tens of thousands of high-resolution images.",
    solution: "We developed a custom frontend architecture utilizing modern CSS grid techniques and fluid typography. The interface relies on a stark contrast between pure editorial layout and subtle interactive micro-interactions that guide the user."
  },
  // Fallback for others
  "default": {
    title: "Project Title",
    role: "Product Design",
    year: "2022",
    client: "Acme Corp",
    duration: "3 Months",
    heroImage: `${import.meta.env.BASE_URL}images/project-3.png`,
    images: [`${import.meta.env.BASE_URL}images/project-4.png`, `${import.meta.env.BASE_URL}images/project-2.png`],
    overview: "A comprehensive digital platform designed from the ground up to solve complex user workflows while maintaining a stark, minimalist aesthetic.",
    challenge: "The existing system was bloated and difficult for new users to understand, leading to high drop-off rates.",
    solution: "A complete reimagining of the user interface, stripping away non-essential elements and focusing purely on the data that matters. We introduced a new design system built on brutalist principles."
  }
};

export function CaseStudy() {
  const { slug } = useParams<{ slug: string }>();
  const project = PROJECTS_DATA[slug || ""] || PROJECTS_DATA["default"];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full p-6 md:p-10 z-50 mix-blend-difference text-white flex justify-between items-center pointer-events-none">
        <Link href="/" className="pointer-events-auto flex items-center gap-2 hover:opacity-70 transition-opacity">
          <ArrowLeft size={20} /> <span className="text-sm font-medium tracking-wide uppercase">Back to Work</span>
        </Link>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 md:px-12 lg:px-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl mb-8">{project.title}</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-border mb-16">
            <div>
              <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Role</h4>
              <p className="font-serif italic text-lg">{project.role}</p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Client</h4>
              <p className="font-serif italic text-lg">{project.client}</p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Year</h4>
              <p className="font-serif italic text-lg">{project.year}</p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Duration</h4>
              <p className="font-serif italic text-lg">{project.duration}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-full aspect-video md:aspect-[21/9] overflow-hidden max-w-7xl mx-auto"
        >
          <img src={project.heroImage} alt={project.title} className="w-full h-full object-cover" />
        </motion.div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 mb-24">
          <div className="md:col-span-4">
            <h3 className="font-serif text-2xl md:text-3xl">Project Overview</h3>
          </div>
          <div className="md:col-span-8">
            <p className="text-lg md:text-xl font-light leading-relaxed text-muted-foreground">
              {project.overview}
            </p>
            <a href="#" className="inline-flex items-center gap-2 mt-8 text-sm uppercase tracking-widest font-medium hover:text-primary transition-colors">
              Visit Live Site <ExternalLink size={16} />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {project.images.map((img: string, i: number) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="aspect-[4/3]"
            >
              <img src={img} alt="Project Detail" className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 mb-24">
          <div className="md:col-span-4">
            <h3 className="font-serif text-2xl md:text-3xl">Challenge & Solution</h3>
          </div>
          <div className="md:col-span-8 space-y-8">
            <div>
              <h4 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">The Challenge</h4>
              <p className="text-lg font-light leading-relaxed">
                {project.challenge}
              </p>
            </div>
            <div>
              <h4 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">The Solution</h4>
              <p className="text-lg font-light leading-relaxed">
                {project.solution}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Next Project CTA */}
      <section className="py-24 border-t border-border bg-foreground text-background text-center flex flex-col items-center justify-center">
        <p className="text-sm uppercase tracking-widest text-background/50 mb-6">Next Project</p>
        <Link href="/work/atelier-stationery" className="group">
          <h2 className="font-serif text-4xl md:text-6xl hover:text-primary transition-colors cursor-pointer">
            Atelier Identity
          </h2>
        </Link>
      </section>
    </div>
  );
}
