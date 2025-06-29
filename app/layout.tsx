import type { Metadata } from "next";
import { Inter, Crimson_Text } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { headers } from "next/headers";
import { Navigation } from "@/components/layout/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const crimsonText = Crimson_Text({
  subsets: ["latin"],
  variable: "--font-crimson",
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Oremus - Duchowa przestrzeń online",
  description:
    "Zamów mszę online, oglądaj transmisje, znajdź kościół w pobliżu. Twoja aplikacja religijna.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={`${inter.variable} ${crimsonText.variable}`}>
      <body
        className={`${inter.className} font-body min-h-screen bg-gradient-to-br from-deep-blue via-purple-900 to-indigo-900`}
      >
        <Providers>
          <Navigation />
          <main className="pt-16">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
