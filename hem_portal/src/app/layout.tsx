import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HEM Associates | Property Valuation & Field Operations",
  icons: {
    icon: [{ url: "/hem-icon.svg?v=hem-2", type: "image/svg+xml", sizes: "any" }, { url: "/hem-icon.png?v=hem-2", type: "image/png", sizes: "32x32" }],
    shortcut: "/favicon.ico?v=hem-2",
    apple: "/hem-apple-icon.png?v=hem-2",
  },
  description: "Land & earth trust property valuation portal for lenders.",
};

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-paper text-ink">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
