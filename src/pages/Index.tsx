import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <motion.img
          src={logo}
          alt="I am Blessed AF"
          className="w-full max-w-xs h-auto object-contain mx-auto mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          The Gratitude Engine™
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Real gratitude. Real confirmation. Real transformation.
        </p>

        {/* CTA */}
        <Button
          onClick={() => navigate("/challenge")}
          className="h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow transition-all duration-300"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Start the 3-Day Challenge
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        {/* Subtext */}
        <p className="text-sm text-muted-foreground mt-6">
          100% Free • Win $1,111 • Takes 2 minutes/day
        </p>
      </motion.div>
    </div>
  );
};

export default Index;
