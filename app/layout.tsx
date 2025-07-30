import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Social Media Post Generator - TruthVibe",
    template: "%s | TruthVibe",
  },
  description: "Create engaging social media posts with custom links and monetization options",
  keywords: ["social media", "post generator", "content creation", "link shortener"],
  authors: [{ name: "TruthVibe" }],
  creator: "TruthVibe",
  publisher: "TruthVibe",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com",
    siteName: "TruthVibe",
    title: "Social Media Post Generator - TruthVibe",
    description: "Create engaging social media posts with custom links and monetization options",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TruthVibe - Social Media Post Generator",
      },
    ],
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    site: "@TruthVibe",
    creator: "@TruthVibe",
    title: "Social Media Post Generator - TruthVibe",
    description: "Create engaging social media posts with custom links and monetization options",
    images: ["/twitter-image.png"],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification
  verification: {
    google: process.env.GOOGLE_VERIFICATION || "",
    yandex: process.env.YANDEX_VERIFICATION || "",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Additional meta tags for better social sharing */}
        <meta property="og:site_name" content="TruthVibe" />
        <meta name="twitter:site" content="@TruthVibe" />
        <meta name="twitter:creator" content="@TruthVibe" />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />

        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://img.youtube.com" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
