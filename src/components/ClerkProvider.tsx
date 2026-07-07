"use client";

import { ClerkProvider as BaseClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const hasValidClerkKeys =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder");

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  if (!hasValidClerkKeys) {
    return <>{children}</>;
  }

  return (
    <BaseClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#6366f1",
          colorBackground: "#ffffff",
          colorText: "#111827",
          colorInputBackground: "#f9fafb",
          colorInputText: "#111827",
        },
        elements: {
          formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700",
          card: "shadow-lg",
        },
      }}
    >
      {children}
    </BaseClerkProvider>
  );
}
