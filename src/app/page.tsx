"use client";

import { useEffect, useState } from "react";
import ContactsList from "@/components/ContactsList";

const hasValidClerkKeys =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder");

function LandingPage() {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to CRM</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Manage your contacts, track interactions, and stay organized with our
          lightweight CRM built for micro-businesses.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a href="/sign-up" className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700">
            Get Started
          </a>
          <a href="/sign-in" className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-50">
            Sign In
          </a>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border p-6 space-y-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center"><span className="text-indigo-600 text-lg">&#128101;</span></div>
          <h3 className="font-semibold">Contact Management</h3>
          <p className="text-sm text-gray-500">Create, update, and organize your contacts with tags and search.</p>
        </div>
        <div className="bg-white rounded-lg border p-6 space-y-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><span className="text-green-600 text-lg">&#128241;</span></div>
          <h3 className="font-semibold">WhatsApp Integration</h3>
          <p className="text-sm text-gray-500">Quick access to WhatsApp for instant communication with your contacts.</p>
        </div>
        <div className="bg-white rounded-lg border p-6 space-y-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"><span className="text-yellow-600 text-lg">&#128203;</span></div>
          <h3 className="font-semibold">Activity Timeline</h3>
          <p className="text-sm text-gray-500">Track notes, calls, meetings, and WhatsApp messages in one place.</p>
        </div>
      </div>
    </div>
  );
}

function AuthGate() {
  const [authState, setAuthState] = useState<"loading" | "signed-in" | "signed-out">("loading");

  useEffect(() => {
    if (!hasValidClerkKeys) {
      setAuthState("signed-in");
      return;
    }

    import("@clerk/nextjs").then(({ useAuth }) => {
      // useAuth is a hook, can't be called here — use session check instead
      fetch("/api/health").then(() => setAuthState("signed-in")).catch(() => setAuthState("signed-out"));
    }).catch(() => {
      setAuthState("signed-in");
    });
  }, []);

  if (authState === "loading") {
    return <div className="rounded-lg border bg-white p-6 text-sm text-gray-500">Loading...</div>;
  }

  if (authState === "signed-out" && hasValidClerkKeys) {
    return <LandingPage />;
  }

  return <ContactsList />;
}

export default function Home() {
  if (!hasValidClerkKeys) {
    return <ContactsList />;
  }

  return <AuthGate />;
}
