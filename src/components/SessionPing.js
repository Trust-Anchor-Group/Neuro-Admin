"use client";

import { useEffect } from "react";

export default function SessionPing() {
  useEffect(() => {
    const pingSession = async () => {
      try {
        const response = await fetch("/api/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", 
        });

        if (!response.ok) {
          console.error("❌ Ping request failed:", response.status);
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
