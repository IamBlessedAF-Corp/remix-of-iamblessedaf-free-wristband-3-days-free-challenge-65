import { useEffect } from "react";

interface PageMeta {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

/**
 * Updates document <title> and Open Graph / Twitter meta tags
 * so in-app sharing tools and social crawlers (on SSR) see route-specific previews.
 *
 * NOTE: Social-media crawlers (WhatsApp, iMessage, etc.) typically only read the
 * server-rendered HTML. This hook ensures client-side accuracy and works when
 * the browser generates link previews (e.g. copy-paste in some apps).
 */
export function usePageMeta({ title, description, image, url }: PageMeta) {
  useEffect(() => {
    const prev = document.title;
    document.title = title;

    const setMeta = (attr: string, key: string, value: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("name", "description", description);

    if (image) {
      const absoluteImage = image.startsWith("http")
        ? image
        : `https://iamblessedaf.com${image}`;
      setMeta("property", "og:image", absoluteImage);
      setMeta("name", "twitter:image", absoluteImage);
    }

    if (url) {
      setMeta("property", "og:url", url);
    }

    return () => {
      document.title = prev;
    };
  }, [title, description, image, url]);
}
