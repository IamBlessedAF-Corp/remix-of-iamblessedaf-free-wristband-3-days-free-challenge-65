import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Trophy, Share2, Gift, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Notification {
  id: string;
  icon: "trophy" | "share" | "gift" | "trending";
  text: string;
  time: string;
  read: boolean;
}

const ICON_MAP = {
  trophy: Trophy,
  share: Share2,
  gift: Gift,
  trending: TrendingUp,
};

const ICON_COLORS = {
  trophy: "text-amber-500",
  share: "text-blue-500",
  gift: "text-primary",
  trending: "text-emerald-500",
};

interface PortalNotificationBellProps {
  userId: string;
}

export default function PortalNotificationBell({ userId }: PortalNotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Check if push is supported and already granted
  useEffect(() => {
    if ("Notification" in window) {
      setPushEnabled(Notification.permission === "granted");
    }
  }, []);

  const requestPushPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Push notifications are not supported in this browser.");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setPushEnabled(perm === "granted");
      if (perm === "granted") {
        toast.success("🔔 Push notifications enabled!");
        new Notification("🙏 Notifications Enabled!", {
          body: "You'll get alerts for BC earned, referrals, and tier milestones.",
          icon: "/favicon.png",
        });
      } else if (perm === "denied") {
        toast.error("Notifications blocked. Enable them in your browser settings.");
      } else {
        toast.info("Notification permission dismissed. Try again anytime.");
      }
    } catch (err) {
      toast.error("Can't request notifications in this environment. Try on the published site.");
    }
  };

  const sendPushNotification = useCallback((title: string, body: string) => {
    if (pushEnabled && document.hidden) {
      new Notification(title, { body, icon: "/favicon.png" });
    }
  }, [pushEnabled]);

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase
      .from("portal_activity")
      .select("id, event_type, display_text, icon_name, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!data) return;

    const mapped: Notification[] = data.map((row) => {
      let icon: Notification["icon"] = "gift";
      if (row.event_type === "streak" || row.event_type === "tier_unlock") icon = "trophy";
      else if (row.event_type === "repost" || row.event_type === "join") icon = "share";
      else if (row.event_type === "blessing") icon = "gift";
      else icon = "trending";

      const now = Date.now();
      const created = new Date(row.created_at).getTime();
      const diffMin = Math.floor((now - created) / 60000);
      let time = "";
      if (diffMin < 1) time = "Just now";
      else if (diffMin < 60) time = `${diffMin}m ago`;
      else if (diffMin < 1440) time = `${Math.floor(diffMin / 60)}h ago`;
      else time = `${Math.floor(diffMin / 1440)}d ago`;

      return { id: row.id, icon, text: row.display_text, time, read: false };
    });

    // Check for new notifications since last viewed
    const lastSeen = localStorage.getItem("notif-last-seen") || "0";
    const newItems = data.filter((r) => new Date(r.created_at).getTime() > parseInt(lastSeen));
    setHasNew(newItems.length > 0);

    // Send push for newest unseen items
    if (newItems.length > 0 && newItems.length <= 3) {
      newItems.forEach((item) => {
        sendPushNotification("🙏 IamBlessedAF", item.display_text);
      });
    } else if (newItems.length > 3) {
      sendPushNotification("🙏 IamBlessedAF", `You have ${newItems.length} new notifications`);
    }

    setNotifications(mapped);
  }, [sendPushNotification]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleOpen = () => {
    setOpen(!open);
    if (!open) {
      setHasNew(false);
      localStorage.setItem("notif-last-seen", Date.now().toString());
    }
  };

  const unreadCount = hasNew ? notifications.filter((n) => !n.read).length : 0;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpen}
        className="relative text-muted-foreground hover:text-foreground"
      >
        <Bell className="w-5 h-5" />
        {hasNew && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
            {Math.min(unreadCount, 9)}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              className="absolute right-0 top-10 z-50 w-80 max-h-96 bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                <div className="flex items-center gap-1">
                  {!pushEnabled && "Notification" in window && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={requestPushPermission}
                      className="h-6 text-[10px] text-primary hover:text-primary/80 px-2"
                    >
                      🔔 Enable Push
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-6 w-6 p-0">
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-72">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif, i) => {
                    const Icon = ICON_MAP[notif.icon];
                    const iconColor = ICON_COLORS[notif.icon];
                    return (
                      <motion.div
                        key={notif.id}
                        className="flex items-start gap-3 px-4 py-3 border-b border-border/20 hover:bg-muted/30 transition-colors"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-muted/50 ${iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground leading-relaxed">{notif.text}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{notif.time}</p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
