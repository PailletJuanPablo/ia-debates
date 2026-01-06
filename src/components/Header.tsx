import { motion } from 'framer-motion';
import { Sparkles, Lightbulb } from 'lucide-react';

const Header = () => {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 glass border-b border-border"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-xl blur-lg opacity-50 animate-pulse-glow" />
              <div className="relative bg-gradient-primary p-2.5 rounded-xl">
                <Lightbulb className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                Continue Feedback
              </h1>
              <p className="text-xs text-muted-foreground">
                El debate continuo de ideas
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-ai" />
            <span>Potenciado por IA</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
