import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Chat Dashboard",
  description: "Live Realtime Chat Admin Panel",
};

import AdminLayoutWrapper from "../components/AdminLayoutWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-black text-white">
        <AdminLayoutWrapper>
          {children}
        </AdminLayoutWrapper>
      </body>
    </html>
  );
}
