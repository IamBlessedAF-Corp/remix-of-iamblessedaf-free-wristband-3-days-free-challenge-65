import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// This page now redirects to the portal, which shows the invite modal inline
export default function CongratsNeuroHacker() {
  const [searchParams] = useSearchParams();
  const nextRoute = searchParams.get("next") || "/portal";

  useEffect(() => {
    window.location.href = nextRoute;
  }, [nextRoute]);

  return null;
}
