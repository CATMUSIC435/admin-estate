import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CMS Admin — ALIZE Real Estate",
  description: "Quản trị nội dung, dự án, bất động sản và khách hàng tiềm năng.",
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
