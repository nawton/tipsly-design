"use client";

import { SIGNUP_SECTION_ID } from "./anchors";

/** Smoothly scrolls to the sign-up form further down the page. */
export function ScrollToFormButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => document.getElementById(SIGNUP_SECTION_ID)?.scrollIntoView({ behavior: "smooth", block: "start" })}
      className={className}
    >
      {children}
    </button>
  );
}
