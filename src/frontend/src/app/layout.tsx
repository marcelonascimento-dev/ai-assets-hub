import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppHeader } from "@/components/app-header";
import { SessionProvider } from "@/components/session-provider";
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
  title: "AI Assets Hub",
  description: "Catálogo corporativo de assets de IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <SessionProvider>
          <AppHeader />
          {children}
          <footer className="app-footer">
            <div className="app-shell footer-content">
              <span>© {new Date().getFullYear()} AI Assets Hub</span>
              <span>Plataforma corporativa de assets de IA</span>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
