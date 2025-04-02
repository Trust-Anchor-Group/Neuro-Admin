import { Inter } from "next/font/google";
import "./globals.css";
import SessionPing from "@/components/SessionPing";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Neuro-Admin Dashboard",
  description: "Neuro-Admin Dashboard for managing users, assets, and payments.",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <SessionPing />

      {children}
      
      </body>
    </html>
  );
}