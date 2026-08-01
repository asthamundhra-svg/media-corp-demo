import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mediacorp Relationship Hub - Demo",
  description: "Agentic CRM for Mediacorp: ad sales, content licensing, talent, sponsorships, DOOH and support desk, driven by an MCP-connected AI agent",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-mc-bg text-[#e7edf5] antialiased">{children}</body>
    </html>
  );
}
