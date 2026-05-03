import type { Metadata } from "next";
import "./globals.css";
import KeepAlive from "../components/KeepAlive";

export const metadata: Metadata = {
  title: "Canvas2Code — Design together. Code together.",
  description: "The collaborative workspace where ideas become reality. Draw, sketch, and code in real-time with your team.",
  keywords: ["collaborative whiteboard", "code editor", "real-time collaboration", "canvas", "team coding"],
  openGraph: {
    title: "Canvas2Code",
    description: "Design together. Code together.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <KeepAlive />
        {children}
      </body>
    </html>
  );
}
