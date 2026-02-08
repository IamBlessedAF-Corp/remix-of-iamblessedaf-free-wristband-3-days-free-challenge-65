import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBcWallet, type BcStoreItem, type BcTransaction } from "@/hooks/useBcWallet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  History,
  Gift,
  Zap,
  Star,
  Loader2,
  CheckCircle2,
  XCircle,
  Flame,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BcWalletModalProps {
  open: boolean;
  onClose: () => void;
}

const reasonLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  checkout: { label: "Purchase Reward", icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  daily_login: { label: "Daily Bonus", icon: <Flame className="w-3.5 h-3.5" /> },
  share: { label: "Share Reward", icon: <Gift className="w-3.5 h-3.5" /> },
  referral: { label: "Referral Bonus", icon: <Star className="w-3.5 h-3.5" /> },
  streak_bonus: { label: "Streak Bonus", icon: <Zap className="w-3.5 h-3.5" /> },
  store_redeem: { label: "Store Redemption", icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  local_sync: { label: "Account Sync", icon: <Sparkles className="w-3.5 h-3.5" /> },
};

const getReasonInfo = (reason: string) =>
  reasonLabels[reason] || { label: reason, icon: <Coins className="w-3.5 h-3.5" /> };

// ─── Transaction Row ───
const TransactionRow = ({ tx }: { tx: BcTransaction }) => {
  const isEarn = tx.type === "earn";
  const info = getReasonInfo(tx.reason);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-2.5 px-1 border-b border-border/50 last:border-b-0"
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isEarn ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"
      )}>
        {info.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{info.label}</p>
        <p className="text-[11px] text-muted-foreground">
          {format(new Date(tx.created_at), "MMM d, h:mm a")}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={cn("text-sm font-bold tabular-nums", isEarn ? "text-green-500" : "text-orange-500")}>
          {isEarn ? "+" : "-"}{tx.amount} BC
        </p>
        <p className="text-[10px] text-muted-foreground tabular-nums">
          Bal: {tx.balance_after}
        </p>
      </div>
    </motion.div>
  );
};

// ─── Store Item Card ───
const StoreItemCard = ({
  item,
  balance,
  onRedeem,
  redeeming,
}: {
  item: BcStoreItem;
  balance: number;
  onRedeem: (item: BcStoreItem) => void;
  redeeming: string | null;
}) => {
  const canAfford = balance >= item.cost_bc;
  const isRedeeming = redeeming === item.id;

  const categoryEmoji: Record<string, string> = {
    discount: "🏷️",
    perk: "⭐",
    mystery: "🎁",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "border rounded-xl p-4 transition-all",
        canAfford
          ? "border-primary/30 bg-primary/5 hover:border-primary/50 hover:shadow-md"
          : "border-border bg-muted/30 opacity-70"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{categoryEmoji[item.category] || "🎯"}</span>
          <h4 className="text-sm font-bold text-foreground">{item.name}</h4>
        </div>
        <Badge
          variant={canAfford ? "default" : "secondary"}
          className="text-[11px] px-2 py-0.5 font-mono"
        >
          🪙 {item.cost_bc}
        </Badge>
      </div>
      {item.description && (
        <p className="text-xs text-muted-foreground mb-3">{item.description}</p>
      )}
      <Button
        size="sm"
        variant={canAfford ? "default" : "outline"}
        className="w-full text-xs h-8"
        disabled={!canAfford || !!redeeming}
        onClick={() => onRedeem(item)}
      >
        {isRedeeming ? (
          <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Redeeming…</>
        ) : canAfford ? (
          <><Gift className="w-3.5 h-3.5 mr-1" /> Redeem</>
        ) : (
          <>Need {item.cost_bc - balance} more BC</>
        )}
      </Button>
    </motion.div>
  );
};

// ─── Main Modal ───
const BcWalletModal = ({ open, onClose }: BcWalletModalProps) => {
  const {
    wallet,
    transactions,
    storeItems,
    redemptions,
    loading,
    isAuthenticated,
    redeemItem,
    claimDailyBonus,
  } = useBcWallet();

  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [dailyClaimed, setDailyClaimed] = useState(false);

  const handleRedeem = async (item: BcStoreItem) => {
    setRedeeming(item.id);
    const success = await redeemItem(item);
    if (success) {
      toast.success(`🎉 Redeemed "${item.name}"!`);
    } else {
      toast.error("Insufficient BC balance");
    }
    setRedeeming(null);
  };

  const handleClaimDaily = async () => {
    const result = await claimDailyBonus();
    if (result.awarded) {
      setDailyClaimed(true);
      toast.success(`🔥 +${result.amount} BC! Streak: ${result.streak} days`);
    } else {
      toast.info("You've already claimed today's bonus!");
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">🪙</span>
            Blessed Coins Wallet
          </DialogTitle>
          <DialogDescription>
            Earn BC through purchases, daily logins, and sharing. Spend them in the store.
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="px-5 pb-5 text-center">
            <Sparkles className="w-10 h-10 mx-auto mb-3 text-primary opacity-60" />
            <p className="text-sm text-muted-foreground mb-2">
              Sign in to access your BC Wallet. Your earned coins will be synced automatically.
            </p>
            <Button onClick={onClose} variant="outline" size="sm">
              Continue Browsing
            </Button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Balance card */}
            <div className="mx-5 mb-3 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Balance</p>
                  <p className="text-3xl font-black text-foreground tabular-nums">
                    {wallet?.balance.toLocaleString() || 0}
                    <span className="text-base font-medium text-muted-foreground ml-1">BC</span>
                  </p>
                </div>
                <div className="text-right space-y-0.5">
                  <div className="flex items-center gap-1 text-[11px] text-green-500">
                    <TrendingUp className="w-3 h-3" />
                    <span className="tabular-nums">{wallet?.lifetime_earned.toLocaleString() || 0} earned</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-orange-500">
                    <TrendingDown className="w-3 h-3" />
                    <span className="tabular-nums">{wallet?.lifetime_spent.toLocaleString() || 0} spent</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-primary">
                    <Flame className="w-3 h-3" />
                    <span>{wallet?.streak_days || 0}-day streak</span>
                  </div>
                </div>
              </div>

              {/* Daily bonus button */}
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs border-primary/30 hover:bg-primary/10"
                onClick={handleClaimDaily}
                disabled={dailyClaimed || wallet?.last_login_bonus_at === new Date().toISOString().split("T")[0]}
              >
                {dailyClaimed || wallet?.last_login_bonus_at === new Date().toISOString().split("T")[0] ? (
                  <><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-500" /> Daily Bonus Claimed</>
                ) : (
                  <><Flame className="w-3.5 h-3.5 mr-1" /> Claim Daily Bonus (+{Math.min(10 + ((wallet?.streak_days || 0)) * 5, 50)} BC)</>
                )}
              </Button>
            </div>

            {/* Tabs: Store / History / Rewards */}
            <Tabs defaultValue="store" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="mx-5 mb-2">
                <TabsTrigger value="store" className="text-xs gap-1">
                  <ShoppingBag className="w-3.5 h-3.5" /> Store
                </TabsTrigger>
                <TabsTrigger value="history" className="text-xs gap-1">
                  <History className="w-3.5 h-3.5" /> History
                </TabsTrigger>
                <TabsTrigger value="rewards" className="text-xs gap-1">
                  <Gift className="w-3.5 h-3.5" /> My Rewards
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto px-5 pb-5">
                <TabsContent value="store" className="mt-0 space-y-3">
                  {storeItems.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">Store coming soon!</p>
                  ) : (
                    storeItems.map((item) => (
                      <StoreItemCard
                        key={item.id}
                        item={item}
                        balance={wallet?.balance || 0}
                        onRedeem={handleRedeem}
                        redeeming={redeeming}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                  {transactions.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">No transactions yet</p>
                  ) : (
                    transactions.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
                  )}
                </TabsContent>

                <TabsContent value="rewards" className="mt-0 space-y-2">
                  {redemptions.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No rewards redeemed yet. Visit the Store to spend your BC!
                    </p>
                  ) : (
                    redemptions.map((r) => (
                      <div key={r.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                        <Gift className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">Reward #{r.redemption_code}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {r.cost_bc} BC · {format(new Date(r.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Badge
                          variant={r.status === "fulfilled" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {r.status === "fulfilled" ? (
                            <><CheckCircle2 className="w-3 h-3 mr-0.5" /> Used</>
                          ) : r.status === "cancelled" ? (
                            <><XCircle className="w-3 h-3 mr-0.5" /> Cancelled</>
                          ) : (
                            "Ready to use"
                          )}
                        </Badge>
                      </div>
                    ))
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BcWalletModal;
