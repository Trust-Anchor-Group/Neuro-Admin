import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import BrandProvider from "@/components/BrandProvider"
import HotjarProvider from "./Layouts/HotjarProvider"
import Script from 'next/script'
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] })
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] })

export const metadata = {
  title: "Neuro-Admin Dashboard",
  description: "Neuro-Admin Dashboard for managing users, assets, and payments.",
}

export default async function RootLayout({ children }) {
  const baseUrl = (process.env.NEXT_PUBLIC_AGENT_API_URL || 'https://kikkin.lab.tagroot.io')
  const baseURI = (process.env.NEXT_PUBLIC_AGENT_HOST || 'kikkin.lab.tagroot.io')
  const cookieStore = await cookies();
  const analyticsConsent = cookieStore.get("analytics_consent")?.value === "granted";
  const eventsScript = `${baseUrl}/Events.js`

  return (
    <html lang="en" >
      <head>
        <meta name="NEURON" content={baseURI} />
        <Script src={eventsScript} strategy="beforeInteractive" />
      </head>
      <body className={`${inter.className} ${grotesk.className}`}>
        <BrandProvider /> 
        <HotjarProvider consent={analyticsConsent} />
        {children}
      </body>
    </html>
  )
}
