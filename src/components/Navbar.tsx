import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <a href="#" className="font-display font-extrabold text-xl tracking-tight text-foreground">
          LAYUP<span className="text-primary">LAB</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">Features</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">How It Works</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">Pricing</a>
          <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">Results</a>
          <Button variant="hero" size="sm" onClick={() => window.location.href = '/auth'}>Get Started</Button>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-background border-b border-border px-6 pb-6 space-y-4">
          <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground font-body">Features</a>
          <a href="#how-it-works" className="block text-sm text-muted-foreground hover:text-foreground font-body">How It Works</a>
          <a href="#pricing" className="block text-sm text-muted-foreground hover:text-foreground font-body">Pricing</a>
          <a href="#testimonials" className="block text-sm text-muted-foreground hover:text-foreground font-body">Results</a>
          <Button variant="hero" size="default" className="w-full" onClick={() => window.location.href = '/auth'}>Get Started</Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
