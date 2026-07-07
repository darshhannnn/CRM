"use client";

import Link from "next/link";

const hasValidClerkKeys =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder");

export function AuthStatus() {
  if (!hasValidClerkKeys) {
    return (
      <div className="ml-2 pl-4 border-l border-gray-200 flex items-center gap-2">
        <span className="text-xs text-gray-400">Demo mode</span>
      </div>
    );
  }

  try {
    const { UserButton } = require("@clerk/nextjs");
    return (
      <div className="ml-2 pl-4 border-l border-gray-200">
        <UserButton
          afterSignOutUrl="/sign-in"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </div>
    );
  } catch {
    return null;
  }
}
