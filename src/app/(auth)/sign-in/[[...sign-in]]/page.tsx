"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <SignIn
        routing="path"
        path="/sign-in"
        appearance={{
          elements: {
            formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white",
            footerActionLink: "text-indigo-600 hover:text-indigo-700",
          },
        }}
        signUpUrl="/sign-up"
      />
      <div className="text-center">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          Back to home
        </Link>
      </div>
    </div>
  );
}
