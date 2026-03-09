"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CreateProjectWizard from "@/components/assets/Tokens/CreateProjectWizard";

export default function CreateProjectPage() {
  return (
    <div className="p-6 min-h-screen bg-[var(--brand-background)]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--brand-text)]">Create Project</h1>
          <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
            Follow the guided steps to publish a localized project with media and resources.
          </p>
        </div>
        <Link
          href="/neuro-assets/Tokens"
          className="inline-flex items-center rounded-lg border border-[var(--brand-border)] bg-[var(--brand-navbar)] px-4 py-2 text-sm font-semibold text-[var(--brand-text)]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
      </div>

      <CreateProjectWizard />
    </div>
  );
}
