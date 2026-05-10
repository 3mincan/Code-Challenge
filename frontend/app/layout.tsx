import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"
import "./globals.css"
import { SkipLink } from "@/components/ui/skip-link"
import { cn } from "@/lib/utils"
import { Providers } from "./providers"

const notionSans = Inter({
  subsets: ["latin"],
  variable: "--font-notion-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Recipe Copilot",
  description:
    "A calm recipe assistant for scaling, substitutions, and cooking progress.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        notionSans.variable,
        geistMono.variable,
        "font-sans"
      )}
    >
      <body className="flex min-h-full flex-col">
        <SkipLink />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
