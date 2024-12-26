// app/onboarding/OnboardingPageClient.tsx (client component)
"use client";

import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import AccountInfo from "@/components/forms/AccountInfo";

export default function OnboardingPageClient({ userData }: { userData: any }) {
  return (
    <main className="mx-auto flex flex-col justify-start px-10 py-20">
      <div className="text-center">
        <h1 className="head-text">Welcome to Twitterrr</h1>
        <p className="mt-3 text-base-regular text-light-2">
          Complete your profile to use Twitterrr
        </p>
      </div>
      <div className="mt-10">
        <UserProfile appearance={{ baseTheme: dark }} routing="hash" />
      </div>
      <AccountInfo user={userData} />
    </main>
  );
}
