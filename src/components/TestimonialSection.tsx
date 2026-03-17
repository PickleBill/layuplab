import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const TestimonialSection = () => {
  return (
    <section id="testimonials" className="py-24 bg-card relative">
      <div className="container">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
        >
          <Quote className="text-primary mx-auto mb-8" size={48} />
          <blockquote className="font-display font-bold text-2xl sm:text-3xl text-foreground leading-snug mb-8">
            "I went from riding the bench to a Varsity starter in one summer. The AI caught a hitch in my jumper that I never would have found on my own.{" "}
            <span className="text-primary">It's like having a coach who never sleeps.</span>"
          </blockquote>
          <div>
            <p className="font-display font-bold text-foreground">Tyler Vance</p>
            <p className="font-body text-muted-foreground text-sm">
              Varsity Guard · Lincoln High School
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialSection;
