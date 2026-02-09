import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useShortLinks } from "@/hooks/useShortLinks";

/**
 * /go/:code — resolves a short link, tracks the click, and redirects.
 * All iamblessedaf.com/go/XXXXXXX links land here.
 */
const GoRedirect = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const { resolveShortCode, trackClick } = useShortLinks();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setError("No link code provided.");
      return;
    }

    const resolve = async () => {
      const result = await resolveShortCode(code);

      if (!result) {
        setError("This link is expired or doesn't exist.");
        return;
      }

      // Track click with UTM params from URL
      trackClick(result.link_id, {
        utm_source: searchParams.get("utm_source") || "",
        utm_medium: searchParams.get("utm_medium") || "",
        utm_campaign: searchParams.get("utm_campaign") || "",
      });

      // Build destination URL with UTM passthrough
      const destUrl = new URL(result.destination_url);
      for (const [key, value] of searchParams.entries()) {
        if (!destUrl.searchParams.has(key)) {
          destUrl.searchParams.set(key, value);
        }
      }

      // Redirect to destination with preserved params
      window.location.replace(destUrl.toString());
    };

    resolve();
  }, [code, resolveShortCode, trackClick, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-bold text-foreground">Link Not Found</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <a href="/" className="text-primary text-sm hover:underline">
          Go to homepage →
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};

export default GoRedirect;
