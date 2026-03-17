import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "The Rookie",
    price: "Free",
    period: "",
    description: "Start building your foundation",
    features: [
      "Daily skill library access",
      "Basic progress tracking",
      "Community challenges",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "The Pro",
    price: "$19.99",
    period: "/mo",
    description: "Unlock your full potential",
    features: [
      "Full AI VisionForm analysis",
      "Personalized adaptive workouts",
      "Advanced footwork metrics",
      "Microlab technique modules",
      "Detailed performance analytics",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "The Elite",
    price: "$179",
    period: "/yr",
    description: "The complete training ecosystem",
    features: [
      "Everything in Pro",
      "Nutrition integration",
      "Whoop / Apple Watch syncing",
      "Coach's Corner progress reports",
      "Priority feature access",
    ],
    cta: "Go Elite",
    highlighted: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 bg-background relative">
      <div className="container">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
        >
          <p className="font-display font-bold text-primary text-sm tracking-[0.3em] uppercase mb-4">
            Pricing
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-foreground">
            Choose Your Level
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              className={`relative rounded-lg border p-8 flex flex-col ${
                tier.highlighted
                  ? "border-primary glow-orange-border scale-[1.02] md:scale-105 bg-card"
                  : "border-surface-border bg-card"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground font-display font-bold text-xs px-4 py-1 rounded-[4px] uppercase tracking-widest">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="font-display font-bold text-lg text-foreground mb-2">
                {tier.name}
              </h3>
              <p className="font-body text-muted-foreground text-sm mb-6">
                {tier.description}
              </p>

              <div className="mb-8">
                <span className="font-display font-extrabold text-4xl text-foreground">
                  {tier.price}
                </span>
                <span className="font-body text-muted-foreground text-sm">
                  {tier.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="text-accent mt-0.5 shrink-0" size={16} />
                    <span className="font-body text-muted-foreground text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={tier.highlighted ? "hero" : "outline"}
                size="lg"
                className="w-full"
              >
                {tier.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
