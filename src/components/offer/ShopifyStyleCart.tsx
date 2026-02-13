import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Tag, Gift, Truck, Check, Sparkles } from "lucide-react";
import shirtFront from "@/assets/product-tshirt-front.webp";
import friendShirtFront from "@/assets/friend-shirt-front.png";
import wristbandImg from "@/assets/product-wristbands-new.avif";

interface ShopifyStyleCartProps {
  friendName: string;
}

const ShopifyStyleCart = ({ friendName }: ShopifyStyleCartProps) => {
  const displayName = friendName || "Best Friend";

  const items = [
    {
      qty: 1,
      name: `White TY Shirt for ${displayName}`,
      image: friendShirtFront,
      originalPrice: 222,
      steps: [
        { label: "77% Coupon Applied", saved: 111, after: 111 },
        { label: "Mystery Box Gift — FREE!", saved: 111, after: 0, isFree: true },
      ],
      finalPrice: 0,
    },
    {
      qty: 1,
      name: "Neuro-Hacker Black Premium Shirt",
      image: shirtFront,
      originalPrice: 333,
      steps: [
        { label: "77% Coupon Applied", saved: 222, after: 111 },
      ],
      finalPrice: 111,
    },
    {
      qty: 3,
      name: "Neuro-Hacker Wristband",
      image: wristbandImg,
      originalPrice: 99,
      unitNote: "3×$33",
      steps: [
        { label: "FREE with Mystery Box", saved: 99, after: 0, isFree: true },
      ],
      finalPrice: 0,
    },
  ];

  const totalRegular = 222 + 333 + 99; // $654
  const finalPrice = 111;
  const totalSaved = totalRegular - finalPrice; // $543

  return (
    <motion.div
      className="mb-8 rounded-2xl border-2 border-primary/30 bg-card overflow-hidden shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="shopping-cart"
    >
      {/* Header */}
      <div className="bg-primary/10 px-4 py-3 flex items-center gap-2 border-b border-primary/20">
        <ShoppingCart className="w-5 h-5 text-primary" />
        <h3 className="text-base font-black text-foreground">Your Gratitude Pack</h3>
        <span className="ml-auto text-xs font-black text-white bg-destructive px-3 py-1 rounded-full">
          77% OFF
        </span>
      </div>

      {/* Items */}
      <div className="divide-y divide-border/30">
        {items.map((item, i) => (
          <motion.div
            key={i}
            className="px-4 py-3.5 flex gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i + 0.2 }}
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-border/40 bg-secondary/30">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-bold text-foreground leading-snug">
                {item.qty > 1 ? `${item.qty}× ` : ""}{item.name}
              </p>

              {/* Original price */}
              <p className="text-xs text-muted-foreground">
                <span className="line-through">${item.originalPrice}</span>
                {item.unitNote && <span className="ml-1">({item.unitNote})</span>}
              </p>

              {/* Coupon steps — each one applied visually */}
              {item.steps.map((step, j) => (
                <div key={j} className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    {step.isFree ? (
                      <Gift className="w-2.5 h-2.5 text-primary" />
                    ) : (
                      <Tag className="w-2.5 h-2.5 text-primary" />
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-primary">{step.label}</span>
                  <span className="text-[11px] text-muted-foreground ml-auto">−${step.saved}</span>
                </div>
              ))}
            </div>

            {/* Final price */}
            <div className="flex-shrink-0 flex flex-col items-end justify-center">
              {item.finalPrice === 0 ? (
                <span className="bg-destructive/90 text-white text-xs font-black px-3 py-1 rounded-full">
                  FREE
                </span>
              ) : (
                <span className="text-xl font-black text-foreground">${item.finalPrice}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Totals */}
      <div className="bg-secondary/30 px-4 py-3.5 space-y-2 border-t border-border/40">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Regular Price</span>
          <span className="text-muted-foreground line-through">${totalRegular}</span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <span className="text-primary font-bold flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> 77% Coupons Applied
          </span>
          <span className="text-primary font-bold">−${totalRegular - 111 - 99}</span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <span className="text-primary font-bold flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5" /> Mystery Box Gifts
          </span>
          <span className="text-primary font-bold">−${111 + 99}</span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> You Save
          </span>
          <span className="font-black text-primary text-base">${totalSaved}</span>
        </div>
        <div className="h-px bg-border/50 my-1" />
        <div className="flex justify-between items-center">
          <span className="text-lg font-black text-foreground">Today's Price</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground line-through">${totalRegular}</span>
            <span className="text-3xl font-black text-primary">${finalPrice}</span>
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
