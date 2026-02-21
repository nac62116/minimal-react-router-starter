import { useEffect } from "react";
import { useFetcher, type useLocation } from "react-router";

export function useMatomo(options: {
  url?: string;
  siteId?: string;
  nonce: string;
}) {
  const { url, siteId, nonce } = options;

  const errorFetcher = useFetcher();

  useEffect(() => {
    if (document.querySelector(`script[src="${url}matomo.js"]`)) return;
    if (typeof siteId === "string" && typeof url === "string") {
      try {
        const _paq = (window._paq = window._paq || []);
        _paq.push(["enableLinkTracking"]);
        _paq.push(["setTrackerUrl", `${url}matomo.php`]);
        _paq.push(["setSiteId", siteId]);
        const matomoScriptElement = document.createElement("script");
        const firstScriptElement = document.getElementsByTagName("script")[0];
        matomoScriptElement.async = true;
        matomoScriptElement.src = `${url}matomo.js`;
        matomoScriptElement.nonce = nonce;
        if (
          firstScriptElement !== null &&
          firstScriptElement.parentNode !== null
        ) {
          firstScriptElement.parentNode.insertBefore(
            matomoScriptElement,
            firstScriptElement
          );
        } else {
          throw new Error(
            "Matomo script element could not be inserted into the DOM."
          );
        }
      } catch (error) {
        console.warn(`Matomo initialization failed.`);
        const formData = new FormData();
        formData.append(
          "error",
          JSON.stringify(error, Object.getOwnPropertyNames(error))
        );
        void errorFetcher.submit(formData, {
          method: "post",
          action: "/error",
        });
      }
    } else {
      console.warn("Matomo initialization skipped. URL or Site ID is missing.");
    }
  }, []);
}

export function useMatomoPageView(options: {
  url?: string;
  siteId?: string;
  location: ReturnType<typeof useLocation>;
}) {
  const { url, siteId, location } = options;

  const errorFetcher = useFetcher();

  useEffect(() => {
    if (
      typeof siteId === "string" &&
      typeof url === "string" &&
      typeof window._paq !== "undefined"
    ) {
      try {
        window._paq.push(["setCustomUrl", window.location.href]);
        window._paq.push(["trackPageView"]);
      } catch (error) {
        console.warn(`Matomo tracking failed.`);
        const formData = new FormData();
        formData.append(
          "error",
          JSON.stringify(error, Object.getOwnPropertyNames(error))
        );
        void errorFetcher.submit(formData, {
          method: "post",
          action: "/error",
        });
      }
    }
  }, [location, siteId, url, errorFetcher]);
}

declare global {
  var _paq:
    | Array<Array<string | number | boolean | ((...args: unknown[]) => void)>>
    | undefined;
  interface Window {
    _paq:
      | Array<Array<string | number | boolean | ((...args: unknown[]) => void)>>
      | undefined;
  }
}
