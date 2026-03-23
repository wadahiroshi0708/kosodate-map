"use client";

import { useState, useEffect } from "react";
import OnboardingModal, { ONBOARDING_DONE_KEY } from "@/components/onboarding/OnboardingModal";

interface OnboardingWrapperProps {
  children: React.ReactNode;
  municipalityId: string;
  municipalityName: string;
}

export default function OnboardingWrapper({
  children,
  municipalityId,
  municipalityName,
}: OnboardingWrapperProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    try {
      const done = localStorage.getItem(ONBOARDING_DONE_KEY);
      if (!done) {
        const t = setTimeout(() => setShowOnboarding(true), 800);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  return (
    <>
      {children}
      {showOnboarding && (
        <OnboardingModal
          municipalityName={municipalityName}
          municipalityId={municipalityId}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </>
  );
}
