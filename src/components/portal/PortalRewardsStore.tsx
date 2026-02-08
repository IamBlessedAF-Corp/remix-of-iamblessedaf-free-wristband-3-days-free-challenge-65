import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Coins, Loader2, Gift, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StoreItem {
  id: string;
  name: string;
  description: string | null;
  cost_bc: number;
  category: string;
  image_url: string | null;
  stock: number | null;
  reward_type: string;
}

interface Props {
  userId: string;
  balance: number;
}

export default function PortalRewardsStore({ userId, balance }: Props) {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("bc_store_items")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      setItems((data as StoreItem[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleRedeem = async (item: StoreItem) => {
    if (balance < item.cost_bc) {
      toast({ variant: "destructive", title: "Not enough BC", description: `You need ${item.cost_bc - balance} more Blessed Coins` });
      return;
    }
    setRedeeming(item.id);
    try {
      // Create redemption
      const { error: redeemErr } = await supabase.from("bc_redemptions").insert({
        user_id: userId,
        store_item_id: item.id,
        cost_bc: item.cost_bc,
        status: "pending",
      });
      if (redeemErr) throw redeemErr;

      // Deduct from wallet
      const { data: wallet } = await supabase
        .from("bc_wallets")
        .select("id, balance, lifetime_spent")
        .eq("user_id", userId)
        .single();

      if (wallet) {
        await supabase
          .from("bc_wallets")
          .update({
            balance: (wallet as any).balance - item.cost_bc,
            lifetime_spent: (wallet as any).lifetime_spent + item.cost_bc,
          })
          .eq("id", (wallet as any).id);
      }

      toast({ title: "🎉 Redeemed!", description: `${item.name} — check your email for details` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Redemption failed", description: err.message });
    }
    setRedeeming(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          Rewards Store
        </h2>
        <div className="flex items-center gap-1.5 bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-full text-sm">
          <Coins className="w-4 h-4" />
          {balance.toLocaleString()} BC
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-xl p-8 text-center space-y-3">
          <Gift className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="text-lg font-semibold text-foreground">Store coming soon!</p>
          <p className="text-sm text-muted-foreground">
            Keep earning BC coins — exclusive rewards are on the way 🚀
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => {
            const canAfford = balance >= item.cost_bc;
            return (
              <motion.div
                key={item.id}
                className="bg-card border border-border/60 rounded-xl overflow-hidden"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="w-full h-40 object-cover" />
                )}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-primary font-bold text-sm">
                      <Coins className="w-3.5 h-3.5" />
                      {item.cost_bc.toLocaleString()} BC
                    </div>
                    {item.stock !== null && (
                      <span className="text-[10px] text-muted-foreground">
                        {item.stock} left
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={() => handleRedeem(item)}
                    disabled={!canAfford || redeeming === item.id}
                    className={`w-full h-10 text-sm font-bold rounded-xl ${
                      canAfford
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {redeeming === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : canAfford ? (
                      <>
                        <Star className="w-3.5 h-3.5 mr-1.5" />
                        Redeem
                      </>
                    ) : (
                      `Need ${(item.cost_bc - balance).toLocaleString()} more BC`
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
