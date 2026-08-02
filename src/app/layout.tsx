import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_Bengali } from "next/font/google";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { rootMetadata } from "@/lib/seo/metadata";

import "./globals.css";

// next/font pulls these at build time and serves them from our own origin, so
// nobody's browser ends up talking to Google on page load. All three are
// variable fonts.

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// For the Bangla edition. preload is off on purpose: this face is 108 KB and
// no English page renders a single Bengali glyph, so preloading it was ~25% of
// page weight spent on nothing for effectively every current reader.
//
// The variable is still declared, so the moment Bangla routing lands the font
// resolves normally — it just isn't fetched until something actually needs it.
// Turn preload back on for the /bn tree when that ships.
const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-bengali",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = rootMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Don't lock zoom. Plenty of readers rely on it and the layout is built to
  // survive 200%.
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#151b24" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning is here because next-themes writes the theme
    // class onto <html> before React hydrates. The server can't know which
    // theme it'll be, so the mismatch is expected. Without this you get a
    // flash of the wrong theme on every navigation, which is miserable if
    // you read in the dark.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${notoSansBengali.variable} flex min-h-dvh flex-col`}
      >
        <ThemeProvider>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
