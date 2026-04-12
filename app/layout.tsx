import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Chat Dashboard",
  description: "Live Realtime Chat Admin Panel",
};

import Sidebar from "../components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-black text-white h-screen flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden bg-[#0A0A0A]">
          {children}
        </main>
      </body>
    </html>
  );
}
