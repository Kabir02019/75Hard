import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "75 Hard Showdown",
  description: "Three friends. One trail. 75 days.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
