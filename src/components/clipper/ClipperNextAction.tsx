import { ArrowRight, CheckCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  clipsThisWeek: number;
  onSubmitClip: () => void;
}

const WEEKLY_TARGET = 10;

const ClipperNextAction = ({ clipsThisWeek, onSubmitClip }: Props) => {
  const remaining = Math.max(0, WEEKLY_TARGET - clipsThisWeek);
  const weekComplete = remaining === 0;

  return (
    <div className={`rounded-2xl p-5 border ${
      weekComplete
        ? "bg-primary/10 border-primary/30"
        : "bg-card border-border/50"
    }`}>
      {weekComplete ? (
        <div className="text-center space-y-3">
          <CheckCircle className="w-8 h-8 text-primary mx-auto" />
          <div>
            <p className="font-bold text-foreground">Week complete! 🎉</p>
            <p className="text-sm text-muted-foreground mt-1">
              Keep posting — every extra clip earns $2.22+ and pushes you toward the next bonus.
            </p>
          </div>
          <Button onClick={onSubmitClip} className="w-full h-12 font-bold rounded-xl">
            <Upload className="w-4 h-4 mr-2" />
            Submit Another Clip
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-3">
          <div>
            <p className="font-bold text-foreground text-lg">
              {remaining === WEEKLY_TARGET
                ? "Upload your first clip"
                : `Post ${remaining} more clip${remaining > 1 ? "s" : ""} to finish the week`}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              One clear next step — no thinking.
            </p>
          </div>
          <Button onClick={onSubmitClip} className="w-full h-12 font-bold rounded-xl btn-glow">
            <Upload className="w-4 h-4 mr-2" />
            Submit a Clip
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ClipperNextAction;
