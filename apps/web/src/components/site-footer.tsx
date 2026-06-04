import Link from "next/link";
import { BrandMark } from "@/components/brand";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-5 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 font-extrabold text-white">
            <BrandMark size={36} />
            CrackGate<span className="text-accent">.in</span>
          </div>
          <p className="text-sm mt-3 text-slate-400 max-w-xs">
            India's dedicated GATE Mining Engineering (MN) test prep. 12 full PYQ papers, 10 mocks, SWOT analytics.
          </p>
        </div>
        <FooterCol title="Practice">
          <FooterLink href="/mocks">Test Series</FooterLink>
          <FooterLink href="/pyq">Previous Year Papers</FooterLink>
          <FooterLink href="/study">Study Material</FooterLink>
          <FooterLink href="/resources">Resources</FooterLink>
        </FooterCol>
        <FooterCol title="Company">
          <FooterLink href="/about">About</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
          <FooterLink href="/faq">FAQ</FooterLink>
          <FooterLink href="/pricing">Pricing</FooterLink>
          {process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL && (
            <li>
              <a
                href={process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#25D366] hover:text-white font-semibold"
              >
                💬 Join WhatsApp Community
              </a>
            </li>
          )}
        </FooterCol>
        <FooterCol title="Legal">
          <FooterLink href="/privacy">Privacy Policy</FooterLink>
          <FooterLink href="/terms">Terms of Service</FooterLink>
          <FooterLink href="/refund">Refund Policy</FooterLink>
        </FooterCol>
      </div>
      <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
        © {year} CrackGate.in · Built for Indian mining aspirants
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-white font-semibold mb-3">{title}</h4>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li><Link href={href} className="text-sm text-slate-400 hover:text-white">{children}</Link></li>
  );
}
