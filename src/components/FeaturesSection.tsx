import { motion } from "framer-motion";
import { Eye, Calendar, Film, Trophy } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "VisionForm Feedback",
    description:
      "Real-time AI analysis of your shooting pocket, elbow alignment, and weight distribution. Correct your form before the bad habits set in.",
  },
  {
    icon: Calendar,
    title: "Adaptive Daily Drills",
    description:
      "No more 'shooting around.' Get a custom 60-minute plan daily—covering footwork, handles, and conditioning—that adjusts based on your performance.",
  },
  {
    icon: Film,
    title: "Microlab Technique Modules",
    description:
      "Get the 'why' behind every rep with 15-second pro-style mechanical breakdowns.",
  },
  {
    icon: Trophy,
    title: "Skill-Chain Gamification",
    description:
      "Level up your 'Player Card.' Complete daily challenges, climb the global leaderboards, and turn every workout into a high-stakes session.",
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="relative rounded-lg border border-surface-border bg-background/50 backdrop-blur-sm p-8 group hover:border-primary/30 transition-colors duration-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <div className="w-12 h-12 rounded-[4px] bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors duration-200">
                <feature.icon className="text-primary" size={24} />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
