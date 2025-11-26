import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/lib/auth-context'
import { LocaleProvider } from '@/lib/locale-context'
import { GoogleAnalyticsWrapper } from '@/components/GoogleAnalytics'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "SpeakNative AI - Learn English with AI",
  description: "AI-powered English learning assistant that helps non-native speakers improve their English skills",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans`}
      >
        <LocaleProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LocaleProvider>
        <GoogleAnalyticsWrapper />
      </body>
    </html>
  );
}
