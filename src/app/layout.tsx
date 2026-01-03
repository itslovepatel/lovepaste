import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LovePaste - Share Code Instantly",
  description: "A simple and fast code sharing tool built by Love Patel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        
        {/* Global Footer */}
        <footer className="mt-auto py-4 border-t border-border/20">
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            Made with Love{" "}
            <span className="inline-block animate-pulse text-red-500">❤️</span>
            {" "}from Gujarat, India
          </div>
        </footer>
      </body>
    </html>
  );
}
