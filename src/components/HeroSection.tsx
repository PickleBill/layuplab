import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import heroBg from "@/assets/hero-court.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden scanline-overlay grain-overlay">
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Basketball player with AI HUD overlay on outdoor court at blue hour"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
      </div>

      <div className="relative z-10 container pt-24 pb-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="font-display font-bold text-primary text-sm tracking-[0.3em] uppercase mb-4">
              AI-Powered Training
            </p>
          </motion.div>

          <motion.h1
            className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          >
            Your Private Coach.{" "}
            <br className="hidden sm:block" />
            Any Court. Any Time.
          </motion.h1>

          <motion.p
            className="font-body text-muted-foreground text-lg sm:text-xl leading-relaxed mb-10 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            Most hoopers can't afford a private coach. Layup Lab puts one in your pocket — AI that watches your form, builds your plan, and pushes you to prove yourself. No gym membership required. Just your phone and a court.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
          >
            <Button variant="hero" size="xl" onClick={() => window.location.href = '/auth'}>
              Get Started
            </Button>
            <Button
              variant="heroOutline"
              size="xl"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Play size={18} />
              Watch How the AI Works
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
