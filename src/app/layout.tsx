import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  metadataBase: new URL("https://theglobalword.org"),
  alternates: {
    canonical: "/",
  },
  title: "The Global Word | Visualisation d'émotions en temps réel",
  description: "Découvrez comment le monde se sent aujourd'hui à travers une visualisation 3D interactive et globale. Partagez votre mot du jour.",
  keywords: ["global word", "visualisation 3D", "émotions mondiales", "temps réel", "carte interactive", "partage", "sentiments"],
  authors: [{ name: "Zenetron" }],
  openGraph: {
    title: "The Global Word",
    description: "Comment se sent le monde aujourd'hui ?",
    url: "https://theglobalword.org",
    siteName: "The Global Word",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Global Word",
    description: "Visualisation d'émotions en temps réel",
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preload" href="/earth-blue-marble.jpg" as="image" />
        <link rel="preload" href="/earth-topology.png" as="image" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
