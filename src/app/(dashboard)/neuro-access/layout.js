"use client";
import AdminShell from "@/components/shared/AdminShell";
import { Suspense } from "react";

export default function DashboardLayout({ children }) {
  return <Suspense fallback={null}><AdminShell>{children}</AdminShell></Suspense>;
}
