import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import AchievementBadge from "./AchievementBadge";
import { useAchievements } from "@/hooks/useAchievements";
import { RARITY_COLORS, type Achievement } from "@/data/achievements";

const CATEGORIES = [
  { id: "all", label: "All", emoji: "🏆" },
  { id: "purchase", label: "Purchase", emoji: "🛍️" },
  { id: "impact", label: "Impact", emoji: "💝" },
  { id: "engagement", label: "Engagement", emoji: "🔥" },
  { id: "streak", label: "Streak", emoji: "⚡" },
] as const;

export default function TrophyCase() {
  const { achievements, unlockedCount, totalCount } = useAchievements();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBadge, setSelectedBadge] = useState<(Achievement & { isUnlocked: boolean; unlockedAt: string | null }) | null>(null);

  const filtered = selectedCategory === "all"
    ? achievements
    : achievements.filter((a) => a.category === selectedCategory);

  return (
    <>
      {/* Trigger button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Trophy className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-bold">{unlockedCount}/{totalCount}</span>
      </Button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

            {/* Content */}
            <motion.div
              className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-foreground">Trophy Case</h2>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                    {unlockedCount}/{totalCount}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Category tabs */}
              <div className="flex gap-1 px-4 py-3 border-b border-border overflow-x-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Badge grid */}
              <ScrollArea className="h-[360px]">
                <div className="grid grid-cols-4 gap-3 p-4">
                  {filtered.map((badge) => (
                    <AchievementBadge
                      key={badge.id}
                      achievement={badge}
                      size="sm"
                      onClick={() => setSelectedBadge(badge)}
                    />
                  ))}
                </div>
              </ScrollArea>

              {/* Badge detail overlay */}
              <AnimatePresence>
                {selectedBadge && (
                  <motion.div
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedBadge(null)}
                  >
                    <motion.div
                      className={`w-full max-w-xs rounded-2xl border-2 p-6 text-center bg-gradient-to-b ${
                        selectedBadge.isUnlocked ? RARITY_COLORS[selectedBadge.rarity] : "from-muted to-muted"
                      }`}
                      initial={{ scale: 0.8, rotateY: -90 }}
                      animate={{ scale: 1, rotateY: 0 }}
                      exit={{ scale: 0.8, rotateY: 90 }}
                      transition={{ type: "spring", damping: 20 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-6xl block mb-3">
                        {selectedBadge.isUnlocked ? selectedBadge.emoji : "🔒"}
                      </span>
                      <h3 className="text-xl font-bold text-white mb-1">{selectedBadge.name}</h3>
                      <p className="text-sm text-white/70 mb-3">{selectedBadge.description}</p>
                      <div className="flex items-center justify-center gap-3 text-xs">
                        <span className="bg-white/20 px-2 py-1 rounded-full text-white font-bold uppercase">
                          {selectedBadge.rarity}
                        </span>
                        <span className="bg-white/20 px-2 py-1 rounded-full text-white font-bold">
                          +{selectedBadge.rewardBc} BC
                        </span>
                      </div>
                      {selectedBadge.isUnlocked && selectedBadge.unlockedAt && (
                        <p className="text-[10px] text-white/50 mt-3">
                          Unlocked {new Date(selectedBadge.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
