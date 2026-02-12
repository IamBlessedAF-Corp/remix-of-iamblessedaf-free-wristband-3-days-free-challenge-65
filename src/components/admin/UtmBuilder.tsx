import { useState, useMemo } from "react";
import { Copy, Check, Link2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useShortLinks } from "@/hooks/useShortLinks";
import { toast } from "sonner";

const DESTINATION_PRESETS = [
  { label: "Offer $111", value: "/offer/111" },
  { label: "Home / Free Wristband", value: "/" },
  { label: "Offer $444", value: "/offer/444" },
  { label: "Offer $1111", value: "/offer/1111" },
  { label: "Offer $4444", value: "/offer/4444" },
  { label: "Portal", value: "/portal" },
  { label: "Challenge", value: "/challenge" },
  { label: "Impact", value: "/impact" },
  { label: "Monthly", value: "/offer/monthly" },
  { label: "Custom URL", value: "__custom__" },
];

const SOURCE_PRESETS = ["instagram", "tiktok", "twitter", "facebook", "youtube", "email", "sms", "podcast", "qr_code"];
const MEDIUM_PRESETS = ["social", "cpc", "email", "sms", "referral", "affiliate", "organic", "display", "video"];

export default function UtmBuilder() {
  const { createShortLink, loading } = useShortLinks();

  const [destination, setDestination] = useState("/offer/111");
  const [customUrl, setCustomUrl] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isCustom = destination === "__custom__";
  const finalDestination = isCustom ? customUrl : destination;

  const previewUrl = useMemo(() => {
    if (!finalDestination) return "";
    try {
      const base = finalDestination.startsWith("http")
        ? finalDestination
        : `https://iamblessedaf.com${finalDestination}`;
      const url = new URL(base);
      if (utmSource) url.searchParams.set("utm_source", utmSource);
      if (utmMedium) url.searchParams.set("utm_medium", utmMedium);
      if (utmCampaign) url.searchParams.set("utm_campaign", utmCampaign);
      return url.toString();
    } catch {
      return "";
    }
  }, [finalDestination, utmSource, utmMedium, utmCampaign]);

  const canGenerate = finalDestination && (utmSource || utmMedium || utmCampaign);

  const handleGenerate = async () => {
    if (!finalDestination) return;

    const destWithUtm = previewUrl.replace("https://iamblessedaf.com", "");

    const result = await createShortLink({
      destination_url: destWithUtm.startsWith("http") ? destWithUtm : destWithUtm,
      campaign: utmCampaign || undefined,
      source_page: "admin-utm-builder",
      custom_code: customCode || undefined,
      metadata: {
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
      },
    });

    if (result) {
      setGeneratedUrl(result.short_url);
      toast.success("Short link created!");
    } else {
      toast.error("Failed to create link");
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setUtmSource("");
    setUtmMedium("");
    setUtmCampaign("");
    setCustomCode("");
    setGeneratedUrl(null);
    setCopied(false);
  };

  return (
    <div className="bg-card border border-border/50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Wand2 className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">UTM Link Builder</h3>
      </div>

      <div className="space-y-4">
        {/* Destination */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Destination Page</Label>
          <Select value={destination} onValueChange={(v) => { setDestination(v); setGeneratedUrl(null); }}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DESTINATION_PRESETS.map((p) => (
                <SelectItem key={p.value} value={p.value} className="text-xs">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isCustom && (
            <Input
              value={customUrl}
              onChange={(e) => { setCustomUrl(e.target.value); setGeneratedUrl(null); }}
              placeholder="https://example.com or /page"
              className="h-9 text-xs mt-1"
            />
          )}
        </div>

        {/* UTM Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">utm_source</Label>
            <Select value={utmSource} onValueChange={(v) => { setUtmSource(v); setGeneratedUrl(null); }}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select source…" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_PRESETS.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">utm_medium</Label>
            <Select value={utmMedium} onValueChange={(v) => { setUtmMedium(v); setGeneratedUrl(null); }}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select medium…" />
              </SelectTrigger>
              <SelectContent>
                {MEDIUM_PRESETS.map((m) => (
                  <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">utm_campaign</Label>
            <Input
              value={utmCampaign}
              onChange={(e) => { setUtmCampaign(e.target.value); setGeneratedUrl(null); }}
              placeholder="e.g. spring-launch"
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Custom short code */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Custom Short Code (optional)</Label>
          <Input
            value={customCode}
            onChange={(e) => { setCustomCode(e.target.value); setGeneratedUrl(null); }}
            placeholder="e.g. offer111-ig"
            className="h-9 text-xs max-w-xs"
          />
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="bg-secondary/50 rounded-lg p-3 space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Destination Preview</p>
            <p className="text-xs text-foreground break-all font-mono">{previewUrl}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            size="sm"
            className="gap-1.5"
          >
            <Link2 className="w-3.5 h-3.5" />
            {loading ? "Creating…" : "Generate Short Link"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-muted-foreground">
            Reset
          </Button>
        </div>

        {/* Result */}
        {generatedUrl && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
            <p className="text-[10px] font-medium text-primary uppercase tracking-wide">Generated Short Link</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-bold text-foreground break-all">{generatedUrl}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(generatedUrl)}
                className="gap-1 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
