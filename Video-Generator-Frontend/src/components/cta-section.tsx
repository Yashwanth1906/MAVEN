import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function CtaSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl bg-gradient-to-br from-primary/90 to-purple-600/90 p-8 md:p-12 text-white text-center shadow-lg"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Transform Your Ideas into Animations?
          </h2>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Start creating stunning mathematical and educational animations with just a text prompt. No coding required.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 text-base font-medium"
            asChild
          >
            <Link to="/maven">
              Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}