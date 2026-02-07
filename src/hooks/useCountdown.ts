import { useState, useEffect } from "react";

const useCountdown = (minutes: number) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = sessionStorage.getItem("offer-timer-end");
    if (saved) {
      const remaining = Math.max(0, Math.floor((parseInt(saved) - Date.now()) / 1000));
      return remaining > 0 ? remaining : minutes * 60;
    }
    const end = Date.now() + minutes * 60 * 1000;
    sessionStorage.setItem("offer-timer-end", end.toString());
    return minutes * 60;
  });

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  return { mins, secs, expired: timeLeft <= 0 };
};

export default useCountdown;
