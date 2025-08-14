"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SessionPing() {
  const router = useRouter();

  useEffect(() => {
    const pingSession = async () => {
      try {
        const response = await fetch("/api/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: '{}',
        });

        if (!response.ok) {
          console.error("❌ Ping request failed:", response.status);
          if (res.status === 403) {
            router.push('/login')
          }
          return;
        }

        const data = await response.json();
        console.log("✅ Ping Successful:");

      } catch (error) {
        console.error("❌ Error pinging session:", error);
      }
    };

    pingSession();

    const interval = setInterval(pingSession, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
