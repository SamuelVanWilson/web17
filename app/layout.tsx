import type { Metadata } from "next";
import "./globals.css";
import AudioPlayer from "@/components/ui/AudioPlayer";

export const metadata: Metadata = {
  title: "The Memory Odyssey - 1 Year Anniversary 💕",
  description: "A romantic journey celebrating one year together",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
        <AudioPlayer />
      </body>
    </html>
  );
}
