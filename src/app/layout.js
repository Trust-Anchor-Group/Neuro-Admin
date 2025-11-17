import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import BrandProvider from "@/components/BrandProvider"
import LanguageProvider from "../../context/LanguageContext";
import HotjarProvider from "./Layouts/HotjarProvider"
import Script from 'next/script'
import { cookies } from "next/headers";
import 'flag-icons/css/flag-icons.min.css';

const inter = Inter({ subsets: ["latin"] })
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] })

export const metadata = {
  title: "Neuro-Admin Dashboard",
  description: "Neuro-Admin Dashboard for managing users, assets, and payments.",
}

export default async function RootLayout({ children }) {
  const agentHost = process.env.AGENT_HOST
  const agentApiUrl = process.env.AGENT_API_URL || `https://${agentHost}`;
  const cookieStore = await cookies();
  const analyticsConsent = cookieStore.get("analytics_consent")?.value === "granted";
  const eventsScript = `${agentApiUrl}/Events.js`;

  return (
    <html lang="en" >
      <head>
        <meta name="NEURON" content={agentHost} />
        <Script src={eventsScript} strategy="beforeInteractive" />
      </head>
      <body className={`${inter.className} ${grotesk.className}`}>
        <LanguageProvider>
          <BrandProvider /> 
          <HotjarProvider consent={analyticsConsent} />
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
