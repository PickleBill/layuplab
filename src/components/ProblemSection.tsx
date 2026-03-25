import { motion } from "framer-motion";

const ProblemSection = () => {
  return (
    <section className="py-24 bg-background relative">
      <div className="container">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
        >
          <p className="font-display font-bold text-primary text-sm tracking-[0.3em] uppercase mb-4">
            The Problem
          </p>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-8">
            The End of Junk Miles.
          </h2>
          <p className="font-body text-muted-foreground text-lg leading-relaxed">
            You're putting in the hours, but nobody's watching. No coach. No feedback. No structure. Just you and a hoop — grinding without knowing if you're getting better or just getting tired. Layup Lab changes that. Get the same corrections a{" "}
            <span className="text-primary font-semibold">$100/hour coach</span>{" "}
            would give you — for a fraction of the cost.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          {[
            { stat: "73%", label: "of solo players plateau without feedback" },
            { stat: "2.3x", label: "faster improvement with AI coaching" },
            { stat: "<1s", label: "real-time form analysis latency" },
          ].map((item) => (
            <div key={item.stat} className="text-center">
              <p className="font-display font-extrabold text-4xl text-primary mb-2">{item.stat}</p>
              <p className="font-body text-muted-foreground text-sm">{item.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;
