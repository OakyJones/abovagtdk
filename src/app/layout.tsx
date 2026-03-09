import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AboVagt – Stop med at betale for det du ikke bruger",
  description:
    "Danskere spilder tusindvis af kroner hvert år på glemte abonnementer. AboVagt finder dem og hjælper dig med at spare.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
