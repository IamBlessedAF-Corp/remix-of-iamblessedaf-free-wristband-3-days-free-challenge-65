import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Framework } from "@/data/expertFrameworks";

interface FrameworkCardProps {
  framework: Framework;
  onGenerate: (framework: Framework) => void;
  hasOutput?: boolean;
}

const FrameworkCard = ({ framework, onGenerate, hasOutput }: FrameworkCardProps) => {
  const IconComponent = (Icons as any)[framework.icon] || Icons.FileText;

  return (
    <motion.div
      className="bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/30 transition-all group cursor-pointer"
      whileHover={{ y: -2 }}
      onClick={() => onGenerate(framework)}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
          <IconComponent className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {framework.secret}
            </span>
            {hasOutput && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                ✓ Generated
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">{framework.name}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{framework.description}</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Sparkles className="w-4 h-4 text-primary" />
        </Button>
      </div>
    </motion.div>
  );
};

export default FrameworkCard;
