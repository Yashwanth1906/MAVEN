import { Code2, Github, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">MAVEN</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Transform your ideas into beautiful Manim animations with our AI-powered platform.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors">Documentation</a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors">Tutorials</a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors">Examples</a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors">Blog</a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Contact</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-muted">
          <p className="text-center text-sm text-muted-foreground">
            A project by Yashwanth S — Made with ❤️ for the users.
          </p>
        </div>
      </div>
    </footer>
  );
}