"use client";
import AdminShell from "@/components/shared/AdminShell";
import { Suspense } from "react";

export default function NeuroAssetsLayout({ children }) {
  return <Suspense fallback={null}><AdminShell>{children}</AdminShell></Suspense>;
}
