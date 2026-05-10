import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Chat Dashboard",
  description: "Live Realtime Chat Admin Panel",
};

import AdminLayoutWrapper from "../components/AdminLayoutWrapper";
import { ToastProvider } from "../components/ui/Toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-black text-white">
        <ToastProvider>
          <AdminLayoutWrapper>
            {children}
          </AdminLayoutWrapper>
        </ToastProvider>
      </body>
    </html>
  );
}
