import { motion } from "framer-motion";
import { Sparkles, Lock } from "lucide-react";
import * as Icons from "lucide-react";
import { Framework } from "@/data/expertFrameworks";

interface FrameworkCardProps {
  framework: Framework;
  onGenerate: (framework: Framework) => void;
  hasOutput?: boolean;
}

const FrameworkCard = ({ framework, onGenerate, hasOutput }: FrameworkCardProps) => {
  const IconComponent = (Icons as any)[framework.icon] || Icons.FileText;

  return (
    <motion.button
      className={`w-full text-left rounded-xl p-3.5 flex items-center gap-3 transition-all border ${
        hasOutput
          ? "bg-primary/5 border-primary/20"
          : "bg-card border-border/40 hover:border-primary/30"
      }`}
      whileTap={{ scale: 0.98 }}
      onClick={() => onGenerate(framework)}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
        hasOutput ? "bg-primary/10" : "bg-accent"
      }`}>
        {hasOutput ? (
          <Sparkles className="w-4 h-4 text-primary" />
        ) : (
          <IconComponent className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
            hasOutput
              ? "text-primary bg-primary/10"
              : "text-muted-foreground bg-muted"
          }`}>
            {framework.secret}
          </span>
          {hasOutput && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-full">
              ✓ Done
            </span>
          )}
        </div>
        <h3 className="text-[13px] font-semibold text-foreground leading-tight truncate">
          {framework.name}
        </h3>
      </div>

      <div className="shrink-0">
        {hasOutput ? (
          <span className="text-[10px] text-primary font-medium">View →</span>
        ) : (
          <span className="text-[10px] text-muted-foreground">Generate →</span>
        )}
      </div>
    </motion.button>
  );
};

export default FrameworkCard;
