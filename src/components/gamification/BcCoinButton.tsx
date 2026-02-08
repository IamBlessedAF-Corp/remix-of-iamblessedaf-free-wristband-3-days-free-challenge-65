import { useState } from "react";
import { motion } from "framer-motion";
import BcWalletModal from "./BcWalletModal";

/**
 * Clickable BC coin badge that opens the wallet modal.
 * Drop this into the GamificationHeader or any funnel page.
 */
const BcCoinButton = ({ balance }: { balance: number }) => {
  const [walletOpen, setWalletOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setWalletOpen(true)}
        className="flex items-center gap-1 shrink-0 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        whileTap={{ scale: 0.92 }}
        title="Open BC Wallet"
      >
        <span className="text-sm">🪙</span>
        <span className="font-bold tabular-nums">{balance.toLocaleString()}</span>
        <span className="hidden sm:inline opacity-70 text-[10px]">BC</span>
      </motion.button>

      <BcWalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </>
  );
};

export default BcCoinButton;
