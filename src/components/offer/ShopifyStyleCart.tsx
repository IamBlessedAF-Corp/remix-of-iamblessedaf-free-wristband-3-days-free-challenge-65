import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Tag, Gift, Truck, Check } from "lucide-react";

interface ShopifyStyleCartProps {
  friendName: string;
}

const ShopifyStyleCart = ({ friendName }: ShopifyStyleCartProps) => {
  const displayName = friendName || "Best Friend";

  const items = [
    {
      qty: 1,
      name: `White TY Neuro-Hacker Shirt for ${displayName}`,
      originalPrice: 222,
      couponLabel: "77% Coupon Applied",
      afterCoupon: 111,
      mysteryLabel: "Mystery Box Gift — FREE Best Friend Shirt",
      finalPrice: 0,
    },
    {
      qty: 1,
      name: "Neuro-Hacker Black Premium Shirt",
      originalPrice: 333,
      couponLabel: "77% Coupon Applied",
      afterCoupon: null,
      mysteryLabel: null,
      finalPrice: 111,
      discount: 222,
    },
    {
      qty: 3,
      name: "Neuro-Hacker Wristband",
      originalPrice: 99,
      unitPrice: 33,
      couponLabel: "FREE Coupon with Mystery Box Applied",
      afterCoupon: null,
      mysteryLabel: null,
      finalPrice: 0,
    },
  ];

  const totalRegular = 222 + 333 + 99; // $654
  const couponDiscount = Math.round(totalRegular * 0.77); // ~$503
  const mysteryBoxDiscount = 111; // free shirt
  const finalPrice = 111;

  return (
    <motion.div
      className="mb-8 rounded-xl border border-border/60 bg-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="shopping-cart"
    >
      {/* Header */}
      <div className="bg-primary/10 px-4 py-3 flex items-center gap-2 border-b border-border/40">
        <ShoppingCart className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-foreground">Your Gratitude Pack</h3>
        <span className="ml-auto text-xs font-semibold text-primary bg-primary/20 px-2 py-0.5 rounded-full">
          77% OFF
        </span>
      </div>

      {/* Items */}
      <div className="divide-y divide-border/30">
        {items.map((item, i) => (
          <div key={i} className="px-4 py-3 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-snug">
                  {item.qty}× {item.name}
                </p>
                <p className="text-xs text-muted-foreground line-through mt-0.5">
                  {item.qty > 1 ? `${item.qty}×$${item.unitPrice} = ` : ""}${item.originalPrice}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                {item.finalPrice === 0 ? (
                  <span className="text-lg font-black text-primary">FREE</span>
                ) : (
                  <span className="text-lg font-black text-foreground">${item.finalPrice}</span>
                )}
              </div>
            </div>
            {/* Coupon badge */}
            <div className="flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-primary">{item.couponLabel}</span>
              {item.discount && (
                <span className="text-xs text-muted-foreground">-${item.discount}</span>
              )}
            </div>
            {/* Mystery box badge */}
            {item.mysteryLabel && (
              <div className="flex items-center gap-1.5">
                <Gift className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium text-primary">{item.mysteryLabel}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="bg-secondary/30 px-4 py-3 space-y-1.5 border-t border-border/40">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Regular Price</span>
          <span className="text-muted-foreground line-through">${totalRegular}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-primary font-semibold flex items-center gap-1">
            <Tag className="w-3 h-3" /> 77% Coupon
          </span>
          <span className="text-primary font-semibold">-${couponDiscount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-primary font-semibold flex items-center gap-1">
            <Gift className="w-3 h-3" /> FREE Mystery Box
          </span>
          <span className="text-primary font-semibold">-${mysteryBoxDiscount}</span>
        </div>
        <div className="h-px bg-border/50 my-1" />
        <div className="flex justify-between items-baseline">
          <span className="text-base font-bold text-foreground">New Discounted Price</span>
          <div className="text-right">
            <span className="text-2xl font-black text-primary">${finalPrice}</span>
          </div>
        </div>
      </div>

      {/* Shipping note */}
      <div className="px-4 py-2.5 bg-primary/5 border-t border-border/40 flex items-center gap-2">
        <Truck className="w-4 h-4 text-primary" />
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">🇺🇸 $9.95 US</span> · <span className="font-semibold text-foreground">🌍 $14.95 Intl</span> — Send a gratitude text for <span className="text-primary font-bold">FREE shipping</span>
        </p>
      </div>

      {/* Science backing */}
      <div className="px-4 py-3 border-t border-border/40">
        <p className="text-xs text-muted-foreground leading-relaxed">
          🧠 <span className="font-semibold text-foreground">8 Neuroscience studies</span> show solid proof: Giving & Receiving Real Gratitude spikes the Happy Chemicals in your Brain.
        </p>
      </div>

      {/* Impact */}
      <div className="px-4 py-3 border-t border-border/40 bg-primary/5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          🍽 <span className="font-semibold text-foreground">111 Reasons to feel GRATEFUL</span> — while you don't even think about going to bed hungry, 14 Million Children in America aren't having the same. <span className="text-primary font-bold">111 of them won't go to bed hungry because of you! Thank You!</span>
        </p>
      </div>
    </motion.div>
  );
};

export default ShopifyStyleCart;
