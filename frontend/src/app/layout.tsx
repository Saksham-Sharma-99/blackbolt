import type { Metadata } from "next";
import { Bangers, Comic_Neue } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import "./globals.css";

const bangers = Bangers({
  weight: "400",
  variable: "--font-bangers",
  subsets: ["latin"],
  display: "swap",
});

const comicNeue = Comic_Neue({
  weight: ["300", "400", "700"],
  variable: "--font-comic-neue",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BLACKBOLT — Turn Comics Into Audio Experiences",
  description:
    "Upload your comics and transform them into fully voice-acted, audio-enhanced experiences with AI-generated character voices, ambient sounds, and music.",
  keywords: [
    "comic to audio",
    "comic voice acting",
    "AI comic reader",
    "comic audiobook",
    "voice acted comics",
    "comic adaptation",
  ],
  openGraph: {
    title: "BLACKBOLT — Turn Comics Into Audio Experiences",
    description:
      "Upload comics and listen to them with AI-generated character voices, ambient audio, and music.",
    type: "website",
    siteName: "BLACKBOLT",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bangers.variable} ${comicNeue.variable} h-full`}
    >
      <body className="min-h-full flex flex-col paper-texture">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
