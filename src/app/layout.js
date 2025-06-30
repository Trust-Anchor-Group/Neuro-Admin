import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import SessionPing from "@/components/SessionPing"
import BrandProvider from "@/components/BrandProvider" // 👈 ny

const inter = Inter({ subsets: ["latin"] })
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] })

export const metadata = {
  title: "Neuro-Admin Dashboard",
  description: "Neuro-Admin Dashboard for managing users, assets, and payments.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" >
      <body className={`${inter.className} ${grotesk.className}`}>
        <SessionPing />
        <BrandProvider /> {/* 👈 Lägg till denna */}
        {children}
      </body>
    </html>
  )
}
