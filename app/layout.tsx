import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import { UIProvider } from "@/context/UIContext";
import { UnhandledRejectionGuard } from "@/components/UnhandledRejectionGuard";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AJAI",
  description:
    "Your intelligent AI assistant powered by advanced language models",
  icons: {
    icon: [{ url: "/AJAI20.svg", type: "image/svg+xml" }],
    shortcut: "/AJAI20.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#2b1d14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <UnhandledRejectionGuard />
        <AuthProvider>
          <UIProvider>
            <ChatProvider>{children}</ChatProvider>
          </UIProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
