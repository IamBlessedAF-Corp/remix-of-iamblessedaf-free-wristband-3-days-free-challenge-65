import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnsubscribeDigest() {
  const [params] = useSearchParams();
  const uid = params.get("uid");
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    if (!uid) { setStatus("error"); return; }
    supabase
      .from("creator_profiles")
      .update({ digest_opted_out: true } as any)
      .eq("user_id", uid)
      .then(({ error }) => setStatus(error ? "error" : "done"));
  }, [uid]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-4">
        {status === "loading" && <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />}
        {status === "done" && (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Unsubscribed</h1>
            <p className="text-muted-foreground">You won't receive the weekly digest email anymore.</p>
            <Button onClick={() => window.location.href = "/affiliate-dashboard"} className="mt-4">
              Back to Portal
            </Button>
          </>
        )}
        {status === "error" && (
          <>
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground">Could not process your request. Try again or contact support.</p>
          </>
        )}
      </div>
    </div>
  );
}
