import type { Metadata, Viewport } from "next";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Weekly planner — 3 roles, 1 system",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Schedule",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#0a0a0b",
          color: "#e4e4e7",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          minHeight: "100vh",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
