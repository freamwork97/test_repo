import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "간단 오목",
  description: "A simple Omok game built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
