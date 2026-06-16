import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/query-provider";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpaceOps - Space Operations & Hazard Telemetry Dashboard",
  description: "Real-time tracking of the ISS, Near-Earth Object hazards, launch schedules, space weather alerts, and AI-driven risk evaluation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jetbrainsMono.variable} dark h-full overflow-hidden`}
      style={{ colorScheme: "dark" }}
    >
      <body className="h-full w-full bg-background text-foreground font-sans overflow-hidden select-none">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
