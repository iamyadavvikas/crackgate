import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { DevPlanSwitcher } from "@/components/dev-plan-switcher";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://crackgate.in"),
  title: { default: "CrackGate.in — #1 GATE Mining Engineering Prep", template: "%s · CrackGate.in" },
  description:
    "India's dedicated platform for GATE Mining Engineering (MN). 10 full-length mocks, 12 years of full PYQ papers (2014–2025), SWOT analytics, and study material. First mock free.",
  keywords: ["GATE Mining", "GATE MN 2027", "Mining Engineering PSU", "Coal India", "ONGC"],
  openGraph: {
    type: "website",
    url: "https://crackgate.in",
    title: "CrackGate.in — #1 GATE Mining Engineering Prep",
    description: "12 full PYQ papers · 10 mocks · SWOT analytics · ₹0 first mock.",
    images: ["/og-banner.png"],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const plan    = (session?.user as { plan?: "free" | "pro" | "premium" } | undefined)?.plan;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  return (
    <html lang="en" className={inter.variable}>
      <body>
        <a href="#main" className="skip-link">Skip to main content</a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <WhatsAppButton />
        {session?.user && <DevPlanSwitcher currentPlan={plan} isAdmin={isAdmin} />}
      </body>
    </html>
  );
}
