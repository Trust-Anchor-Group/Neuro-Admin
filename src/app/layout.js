import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import BrandProvider from "@/components/BrandProvider"
import HotjarProvider from "./Layouts/HotjarProvider"
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] })
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] })

export const metadata = {
  title: "Neuro-Admin Dashboard",
  description: "Neuro-Admin Dashboard for managing users, assets, and payments.",
}

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const analyticsConsent = cookieStore.get("analytics_consent")?.value === "granted";

  return (
    <html lang="en" >
      <body className={`${inter.className} ${grotesk.className}`}>
        <BrandProvider /> 
        <HotjarProvider consent={analyticsConsent} />
        {children}
      </body>
    </html>
  )
}
