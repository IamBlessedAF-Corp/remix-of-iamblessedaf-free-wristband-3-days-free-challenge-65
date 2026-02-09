import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";

/**
 * Simulated regional donation data.
 * In production this would come from order geo data.
 */
const REGIONS = [
  { id: "us-west", name: "West Coast", lat: 37, lng: 20, meals: 3240, color: "bg-primary" },
  { id: "us-south", name: "South", lat: 52, lng: 35, meals: 2870, color: "bg-primary" },
  { id: "us-east", name: "East Coast", lat: 28, lng: 30, meals: 2510, color: "bg-primary" },
  { id: "us-mid", name: "Midwest", lat: 38, lng: 28, meals: 1430, color: "bg-primary/80" },
  { id: "eu", name: "Europe", lat: 58, lng: 22, meals: 620, color: "bg-primary/60" },
  { id: "latam", name: "Latin America", lat: 32, lng: 55, meals: 340, color: "bg-primary/60" },
  { id: "asia", name: "Asia", lat: 72, lng: 30, meals: 180, color: "bg-primary/50" },
  { id: "africa", name: "Africa", lat: 55, lng: 45, meals: 57, color: "bg-primary/50" },
];

/** Simulated live donations popping up */
const LIVE_DONATIONS = [
  { name: "Sarah", region: "Texas", meals: 11 },
  { name: "Mark", region: "California", meals: 1111 },
  { name: "Emily", region: "New York", meals: 22 },
  { name: "Juan", region: "Florida", meals: 11 },
  { name: "Aisha", region: "London", meals: 11 },
  { name: "Raj", region: "Toronto", meals: 22 },
  { name: "Lena", region: "Berlin", meals: 11 },
  { name: "Carlos", region: "Mexico City", meals: 11 },
];

export default function DonationMap() {
  const [activePing, setActivePing] = useState<number | null>(null);
  const [liveDonation, setLiveDonation] = useState(0);

  // Simulate live donation pings
  useEffect(() => {
    const interval = setInterval(() => {
      const randomRegion = Math.floor(Math.random() * REGIONS.length);
      setActivePing(randomRegion);
      setLiveDonation((d) => (d + 1) % LIVE_DONATIONS.length);
      setTimeout(() => setActivePing(null), 2000);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Impact <span className="text-primary">Around the World</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Live donations from the Blessed community
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Map visualization */}
        <div className="relative bg-card border border-border rounded-2xl overflow-hidden p-6 sm:p-8">
          {/* Stylized world grid */}
          <div className="relative aspect-[2/1] w-full">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            />

            {/* Region dots */}
            {REGIONS.map((region, i) => (
              <motion.div
                key={region.id}
                className="absolute group cursor-pointer"
                style={{ left: `${region.lat}%`, top: `${region.lng}%` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                {/* Ping animation when active */}
                {activePing === i && (
                  <motion.div
                    className="absolute -inset-4 rounded-full bg-primary/20"
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 1.5 }}
                  />
                )}

                {/* Dot */}
                <div
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${region.color} shadow-lg ring-2 ring-background transition-transform group-hover:scale-150`}
                />

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-foreground text-background text-[10px] sm:text-xs font-medium rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-xl">
                    <p className="font-bold">{region.name}</p>
                    <p className="opacity-80">{region.meals.toLocaleString()} meals</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Live donation feed overlay */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-64">
            <AnimatePresence mode="wait">
              <motion.div
                key={liveDonation}
                className="bg-foreground/95 backdrop-blur-sm text-background rounded-xl px-3 py-2.5 shadow-xl flex items-center gap-2.5"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">
                    {LIVE_DONATIONS[liveDonation].name} from {LIVE_DONATIONS[liveDonation].region}
                  </p>
                  <p className="text-[10px] opacity-70">
                    just funded {LIVE_DONATIONS[liveDonation].meals} meals 🍽️
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Region breakdown grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {REGIONS.slice(0, 4).map((region, i) => (
            <motion.div
              key={region.id}
              className="bg-card border border-border rounded-xl p-4 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
            >
              <p className="text-2xl font-black text-foreground">
                {region.meals.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{region.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
