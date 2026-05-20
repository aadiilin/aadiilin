import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <h1 className="font-serif text-8xl md:text-9xl text-primary mb-6">404</h1>
        <h2 className="font-serif text-2xl md:text-3xl mb-4">Page not found</h2>
        <p className="text-muted-foreground font-light mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link href="/" className="inline-flex items-center gap-2 uppercase tracking-widest text-sm font-medium hover:text-primary transition-colors pb-1 border-b border-foreground hover:border-primary">
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    </div>
  );
}
