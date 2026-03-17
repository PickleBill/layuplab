import { motion } from "framer-motion";
import { Quote, Users, Crosshair, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const stats = [
  { icon: Users, value: "10,000+", label: "Athletes" },
  { icon: Crosshair, value: "2.3M", label: "Shots Analyzed" },
  { icon: TrendingUp, value: "47%", label: "Avg. Improvement" },
];

const testimonials = [
  {
    initials: "TV",
    name: "Tyler Vance",
    role: "Varsity Guard · Lincoln High School",
    stat: "+18 PPG",
    quote:
      "I went from riding the bench to a Varsity starter in one summer. The AI caught a hitch in my jumper that I never would have found on my own. It's like having a coach who never sleeps.",
  },
  {
    initials: "MS",
    name: "Maria Santos",
    role: "AAU Forward · SoCal Elite",
    stat: "32% → 61%",
    quote:
      "The adaptive drills fixed my weak-hand finishing. My left-side layup percentage went from 32% to 61% in 8 weeks. I'm a completely different player now.",
  },
  {
    initials: "CD",
    name: "Coach Davis",
    role: "Head Coach · Westbrook High",
    stat: "12 players tracked",
    quote:
      "I use the Coach's Corner reports to track my whole team's off-season progress. Game-changer for recruiting packets and parent meetings.",
  },
];

const TestimonialSection = () => {
  return (
    <section id="testimonials" className="py-24 bg-card relative">
      <div className="container">
        {/* Stats bar */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <stat.icon className="text-primary" size={20} />
              </div>
              <div>
                <p className="font-display font-extrabold text-2xl text-foreground">{stat.value}</p>
                <p className="font-body text-muted-foreground text-sm">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
        >
          <p className="font-display font-bold text-primary text-sm tracking-[0.3em] uppercase mb-4">
            Results
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-foreground">
            Real Players. Real Gains.
          </h2>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="relative rounded-lg border border-surface-border bg-background/50 backdrop-blur-sm p-8 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: i * 0.08 }}
            >
              <Quote className="text-primary/30 mb-4" size={28} />
              <blockquote className="font-body text-muted-foreground leading-relaxed mb-6 flex-1">
                "{t.quote}"
              </blockquote>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-display font-bold text-sm">
                    {t.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-display font-bold text-foreground text-sm">{t.name}</p>
                  <p className="font-body text-muted-foreground text-xs">{t.role}</p>
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary font-display text-xs tracking-wider">
                  {t.stat}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
