import { motion } from "framer-motion";
import { 
  MessageSquareText, 
  Code2, 
  Bot, 
  PlayCircle,
  Sparkles 
} from "lucide-react";

const features = [
  {
    title: "Prompt-to-Animation",
    description: "Type your idea, get a Manim animation instantly without writing a single line of code.",
    icon: MessageSquareText,
  },
  {
    title: "Error Self-Correction",
    description: "Our AI automatically detects and fixes Manim code errors, ensuring your animations always render correctly.",
    icon: Sparkles,
  },
  {
    title: "Code Transparency",
    description: "View and download the exact Python code used to create your animation for learning or customization.",
    icon: Code2,
  },
  {
    title: "Agentic Workflow",
    description: "Powered by intelligent agents collaborating to generate accurate and educational results.",
    icon: Bot,
  },
  {
    title: "Auto Execution & Preview",
    description: "No setup needed — preview your video directly in your browser without any local installations.",
    icon: PlayCircle,
  },
];

export function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    },
  };

  return (
    <section id="features" className="py-20 md:py-32 bg-muted/50">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Powered by <span className="gradient-text">Intelligent AI</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            MAVEN combines the power of agentic AI with the Manim animation library to create stunning visual content from simple text prompts.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-card rounded-lg p-6 shadow-sm border transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-primary/20"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}