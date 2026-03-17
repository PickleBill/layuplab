import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import heroBg from "@/assets/hero-court.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden scanline-overlay grain-overlay">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Basketball player with AI HUD overlay on outdoor court at blue hour"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
      </div>

      {/* Content */}
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
            Stop practicing hard and start training smart. Layup Lab uses AI to analyze your shooting form, track your dribbling speed, and build personalized daily workouts that evolve with your skill level.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
          >
            <Button variant="hero" size="xl">
              Start Your 7-Day Free Trial
            </Button>
            <Button variant="heroOutline" size="xl">
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
