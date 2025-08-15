"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { hjStateChange, initHotjar } from "@/utils/hotjar";

export default function HotjarProvider({ consent }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const enableDev = process.env.NEXT_PUBLIC_HOTJAR_ENABLE_DEV === "true";
  const bypassConsent = process.env.NEXT_PUBLIC_HOTJAR_BYPASS_CONSENT === "true";
  const hasConsent = consent || bypassConsent;

  useEffect(() => {
    const siteId = process.env.NEXT_PUBLIC_HOTJAR_ID;
    const isProd = process.env.NODE_ENV === "production";
    if ((isProd || enableDev) && hasConsent && siteId) {
      initHotjar(Number(siteId));
    }
  }, [hasConsent, enableDev]);

  useEffect(() => {
    if (!hasConsent) return;
    const url = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    hjStateChange(url);
  }, [pathname, searchParams, hasConsent]);

  return null;
}