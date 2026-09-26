import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { profile } from "@/content/profile";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: `Neuron — ${profile.name}`, template: `%s — ${profile.name}` },
  description: profile.intro,
};

const nav = [
  { href: "/#skills", label: "Skills" },
  { href: "/#career", label: "Career" },
  { href: "/#works", label: "Works" },
  { href: "/#contact", label: "Contact" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="fixed inset-x-0 top-0 z-30 border-b border-line/60 bg-background/70 backdrop-blur">
          <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 text-sm">
            <Link href="/" className="font-semibold tracking-tight">
              neuron
            </Link>
            <ul className="flex gap-5 text-muted">
              {nav.map((n) => (
                <li key={n.href} className="hidden sm:block">
                  <Link href={n.href} className="hover:text-foreground">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mx-auto w-full max-w-6xl px-6 py-10 text-sm text-muted">
          © {new Date().getFullYear()} {profile.name}
        </footer>
      </body>
    </html>
  );
}
