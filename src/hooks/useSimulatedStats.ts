import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGlobalMeals } from "@/hooks/useGlobalMeals";

// Thresholds: show real numbers once DB count exceeds these
const PARTICIPANT_THRESHOLD = 50;
const MEALS_THRESHOLD = 100;

// Simulated numbers for pre-launch social proof
const SIMULATED = {
  participants: 2340,
  meals: 25000,
  wristbands: 4800,
  hearts: 8720,
  global: 3150,
};

export function useSimulatedStats() {
  const { meals: realMeals, loading: mealsLoading } = useGlobalMeals();
  const [realParticipants, setRealParticipants] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { count } = await supabase
        .from("challenge_participants")
        .select("*", { count: "exact", head: true });
      if (count !== null) setRealParticipants(count);
      setLoading(false);
    };
    fetch();
  }, []);

  const useRealParticipants = realParticipants >= PARTICIPANT_THRESHOLD;
  const useRealMeals = realMeals >= MEALS_THRESHOLD;

  return {
    participants: useRealParticipants ? realParticipants : SIMULATED.participants,
    meals: useRealMeals ? realMeals : SIMULATED.meals,
    wristbands: useRealParticipants ? realParticipants : SIMULATED.wristbands,
    isSimulated: !useRealParticipants || !useRealMeals,
    loading: loading || mealsLoading,
  };
}
