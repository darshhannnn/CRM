import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM",
  description: "Lightweight CRM for micro-businesses",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-gray-900">
                CRM
              </Link>
              <nav className="flex items-center gap-4">
                <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Contacts
                </Link>
                <Link
                  href="/tags"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Tags
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
