import { useEffect, useRef, useCallback } from "react";

const SITE_KEY = "6LfClW0sAAAAACVBa8HPPSCnvhGk3AsaY8Bkr_On";

interface ReCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad: () => void;
  }
}

export default function ReCaptcha({ onVerify, onExpire }: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const rendered = useRef(false);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || rendered.current) return;
    if (!window.grecaptcha?.render) return;

    rendered.current = true;
    widgetId.current = window.grecaptcha.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: (token: string) => onVerify(token),
      "expired-callback": () => onExpire?.(),
      theme: "dark",
      size: "normal",
    });
  }, [onVerify, onExpire]);

  useEffect(() => {
    // If script already loaded
    if (window.grecaptcha?.render) {
      renderWidget();
      return;
    }

    // Load script
    const existing = document.querySelector('script[src*="recaptcha"]');
    if (!existing) {
      window.onRecaptchaLoad = renderWidget;
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else {
      // Script exists but hasn't loaded yet
      const interval = setInterval(() => {
        if (window.grecaptcha?.render) {
          clearInterval(interval);
          renderWidget();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [renderWidget]);

  return <div ref={containerRef} className="flex justify-center" />;
}
