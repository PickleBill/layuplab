import { motion } from "framer-motion";
import { Eye, Calendar, Film, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Eye,
    title: "VisionForm Feedback",
    tagline: "See what the pros see",
    description:
      "Real-time AI analysis of your shooting pocket, elbow alignment, and weight distribution. Correct your form before the bad habits set in.",
    metric: "17 joint points tracked",
    hudElement: (
      <svg viewBox="0 0 120 60" className="w-full h-full opacity-20 group-hover:opacity-40 transition-opacity duration-300">
        <path d="M10 50 Q30 10 60 30 Q90 50 110 15" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="60" cy="30" r="4" fill="hsl(var(--primary))" opacity="0.6" />
        <circle cx="10" cy="50" r="3" fill="hsl(var(--primary))" opacity="0.4" />
        <circle cx="110" cy="15" r="3" fill="hsl(var(--primary))" opacity="0.4" />
      </svg>
    ),
  },
  {
    icon: Calendar,
    title: "Adaptive Daily Drills",
    tagline: "Your plan. Your pace.",
    description:
      "No more 'shooting around.' Get a custom 60-minute plan daily—covering footwork, handles, and conditioning—that adjusts based on your performance.",
    metric: "60-min custom plans",
    hudElement: (
      <svg viewBox="0 0 120 60" className="w-full h-full opacity-20 group-hover:opacity-40 transition-opacity duration-300">
        {[0, 1, 2, 3, 4].map((col) =>
          [0, 1, 2].map((row) => (
            <rect
              key={`${col}-${row}`}
              x={10 + col * 22}
              y={8 + row * 18}
              width="16"
              height="12"
              rx="2"
              fill={col <= 2 && row <= 1 ? "hsl(var(--primary))" : "none"}
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              opacity={col <= 2 && row <= 1 ? 0.3 : 0.15}
            />
          ))
        )}
      </svg>
    ),
  },
  {
    icon: Film,
    title: "Microlab Technique Modules",
    tagline: "The 'why' behind every rep",
    description:
      "Get the 'why' behind every rep with 15-second pro-style mechanical breakdowns.",
    metric: "15-sec breakdowns",
    hudElement: (
      <svg viewBox="0 0 120 60" className="w-full h-full opacity-20 group-hover:opacity-40 transition-opacity duration-300">
        <rect x="20" y="10" width="80" height="40" rx="4" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        <polygon points="50,22 50,38 68,30" fill="hsl(var(--primary))" opacity="0.4" />
        <line x1="20" y1="44" x2="65" y2="44" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.5" />
      </svg>
    ),
  },
  {
    icon: Trophy,
    title: "Skill-Chain Gamification",
    tagline: "Compete. Level up. Repeat.",
    description:
      "Level up your 'Player Card.' Complete daily challenges, climb the global leaderboards, and turn every workout into a high-stakes session.",
    metric: "Global leaderboard",
    hudElement: (
      <svg viewBox="0 0 120 60" className="w-full h-full opacity-20 group-hover:opacity-40 transition-opacity duration-300">
        <rect x="15" y="25" width="20" height="25" rx="2" fill="hsl(var(--primary))" opacity="0.2" />
        <rect x="45" y="10" width="20" height="40" rx="2" fill="hsl(var(--primary))" opacity="0.35" />
        <rect x="75" y="18" width="20" height="32" rx="2" fill="hsl(var(--primary))" opacity="0.25" />
        <text x="25" y="22" textAnchor="middle" fill="hsl(var(--primary))" fontSize="10" fontWeight="bold" opacity="0.5">2</text>
        <text x="55" y="8" textAnchor="middle" fill="hsl(var(--primary))" fontSize="10" fontWeight="bold" opacity="0.5">1</text>
        <text x="85" y="16" textAnchor="middle" fill="hsl(var(--primary))" fontSize="10" fontWeight="bold" opacity="0.5">3</text>
      </svg>
    ),
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-card relative">
      <div className="container">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
        >
          <p className="font-display font-bold text-primary text-sm tracking-[0.3em] uppercase mb-4">
            Core Features
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-foreground">
            Your AI Training Stack
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="relative rounded-lg border border-surface-border bg-background/50 backdrop-blur-sm p-8 group hover:border-primary/30 transition-colors duration-200 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              {/* HUD illustration background */}
              <div className="absolute top-4 right-4 w-28 h-14 pointer-events-none">
                {feature.hudElement}
              </div>

              {/* Icon + tagline */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-[4px] bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors duration-200">
                  <feature.icon className="text-primary" size={24} />
                </div>
                <p className="font-body text-primary/70 text-sm italic">
                  {feature.tagline}
                </p>
              </div>

              {/* Title + description */}
              <h3 className="font-display font-bold text-xl text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed mb-5 flex-1">
                {feature.description}
              </p>

              {/* Metric badge */}
              <div>
                <Badge variant="outline" className="border-primary/30 text-primary font-display text-xs tracking-wider uppercase">
                  {feature.metric}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
