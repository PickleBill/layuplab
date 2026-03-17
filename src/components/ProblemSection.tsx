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
            Most solo players spend hours at the court but never see their shooting percentage rise. Why? Because they lack professional feedback. Layup Lab captures your movement through your phone's camera, providing instant biomechanical corrections—just like a{" "}
            <span className="text-primary font-semibold">$100/hour private trainer</span>.
          </p>
        </motion.div>

        {/* Stats row */}
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
