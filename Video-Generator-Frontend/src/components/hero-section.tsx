import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section 
      id="home" 
      className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_60%)]" />
      
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight md:leading-tight lg:leading-tight gradient-text">
              Bring Your Ideas to Life with MAVEN
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
              An agentic AI that transforms your prompts into beautiful Manim animations.
              No coding required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="text-base font-medium">
                <Link to="/maven">Try Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              
              <Button size="lg" variant="outline" className="text-base font-medium">
                Learn More
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="rounded-lg border bg-card shadow-xl overflow-hidden"
          >
            <div className="relative aspect-video w-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-t-lg" />
              <div className="text-center p-8 relative">
                <div className="inline-block p-3 rounded-full bg-primary/10 mb-4 animate-pulse-slow">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-2xl font-semibold text-white">AI</span>
                  </div>
                </div>
                <p className="text-lg font-medium">Animation preview loading...</p>
                <p className="text-sm text-muted-foreground mt-2">Your Manim animation will appear here</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-3">
                <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">M</span>
                </div>
                <div className="flex-1">
                  <div className="rounded-2xl rounded-tl-none bg-muted p-4">
                    <p className="text-sm">
                      <span className="font-medium">Prompt:</span> Create an animation showing the derivative of a sine function
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Processing with agentic AI...</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}