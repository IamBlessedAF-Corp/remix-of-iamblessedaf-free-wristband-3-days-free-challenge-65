import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  // Listen for the PASSWORD_RECOVERY event from the auth hash
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Check URL hash for recovery type
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setReady(true);
    }

    // Also check if we already have a session (user clicked the link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSuccess(true);
    toast.success("¡Contraseña actualizada! 🎉");

    // Redirect based on role after 2s
    setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/", { replace: true });
        return;
      }

      const { data: roles } = await (supabase.from("user_roles" as any) as any)
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "super_admin", "developer"]);

      const roleList = (roles || []).map((r: any) => r.role);
      if (roleList.includes("super_admin") || roleList.includes("admin")) {
        navigate("/co-founder", { replace: true });
      } else if (roleList.includes("developer")) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/portal", { replace: true });
      }
    }, 2000);
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Verificando tu link de recuperación…</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <CheckCircle className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-xl font-bold text-foreground">¡Contraseña actualizada!</h1>
          <p className="text-sm text-muted-foreground">Redirigiendo a tu dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <Lock className="w-10 h-10 text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Nueva contraseña</h1>
          <p className="text-sm text-muted-foreground">Ingresa tu nueva contraseña (mínimo 8 caracteres)</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Input
            type={show ? "text" : "password"}
            placeholder="Confirmar contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <Button
            className="w-full"
            disabled={loading || password.length < 8 || password !== confirm}
            onClick={handleReset}
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
            Actualizar contraseña
          </Button>
        </div>
      </div>
    </div>
  );
}
