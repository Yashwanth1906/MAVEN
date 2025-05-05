import { motion } from "framer-motion";
import { Button } from "./ui/button";

export function DemoSection() {
  return (
    <section id="demo" className="py-20 md:py-32">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See <span className="gradient-text">MAVEN</span> in Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch how a simple text prompt transforms into a beautiful mathematical animation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="space-y-4 text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-2">
                User Prompt
              </div>
              <div className="p-4 rounded-lg bg-muted/70 border">
                <p className="font-mono text-sm">
                  "Show me the unit circle with sine and cosine functions and how they relate to the angle theta"
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">This single prompt generates:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <span>Animation showing a unit circle with an angle θ</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <span>Visual representation of sine and cosine as projections</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <span>Animated traces of the sine and cosine functions</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">4</span>
                  </div>
                  <span>Clear mathematical explanations with proper notation</span>
                </li>
              </ul>

              <div className="pt-4">
                <Button>
                  Try this example
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="aspect-video rounded-lg overflow-hidden border shadow-lg bg-card"
          >
            <div className="relative w-full h-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10" />
              <div className="text-center p-8 relative">
                <p className="text-lg font-medium">Demo Animation</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Created with just one line of prompt
                </p>
                <div className="mt-8 max-w-md mx-auto rounded-lg overflow-hidden border bg-card/50 backdrop-blur-sm">
                  <div className="p-4 border-b bg-muted/30">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 rounded-full bg-destructive/70"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                    </div>
                  </div>
                  <div className="p-8 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}