import { motion } from "framer-motion";
import { Smartphone, ScanEye, Target } from "lucide-react";

const steps = [
  {
    icon: Smartphone,
    number: "01",
    title: "Set Up Your Phone",
    description:
      "Prop your phone against a fence or lean it on the ground. No tripod, no extra gear.",
  },
  {
    icon: ScanEye,
    number: "02",
    title: "AI Analyzes Your Movement",
    description:
      "Our computer vision tracks 17 skeletal joints in real-time, measuring shooting arc, release angle, and footwork patterns.",
  },
  {
    icon: Target,
    number: "03",
    title: "Get Instant Corrections",
    description:
      "Receive on-screen coaching cues and post-session breakdowns that pinpoint exactly what to fix.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="container relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
        >
          <p className="font-display font-bold text-primary text-sm tracking-[0.3em] uppercase mb-4">
            How It Works
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-foreground">
            Three Steps. Zero Excuses.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 max-w-5xl mx-auto relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-[72px] left-[16.67%] right-[16.67%] h-px border-t-2 border-dashed border-primary/20 z-0" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="relative z-10 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: i * 0.1 }}
            >
              {/* Icon container with HUD aesthetic */}
              <div className="relative w-36 h-36 mb-8 group">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full border border-primary/20 group-hover:border-primary/40 transition-colors duration-300" />
                {/* Inner container */}
                <div className="absolute inset-3 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                  <step.icon className="text-primary" size={36} />
                </div>
                {/* Step number badge */}
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="font-display font-bold text-primary-foreground text-sm">
                    {step.number}
                  </span>
                </div>
                {/* Corner brackets for HUD look */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/30 rounded-tl" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/30 rounded-br" />
              </div>

              <h3 className="font-display font-bold text-xl text-foreground mb-3">
                {step.title}
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
