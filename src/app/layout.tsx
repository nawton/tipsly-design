import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { DemoNotice } from "@/components/layout/demo-notice";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AppProviders } from "@/components/providers/app-providers";
import { DEFAULT_CITY, isCity } from "@/lib/data";
import { CITY_COOKIE } from "@/lib/routes";
import { INDEXABLE, SITE_URL } from "@/lib/site";
import styles from "./layout.module.css";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tipsly – Upptäck din stad",
    template: "%s · Tipsly",
  },
  description:
    "Upptäck lokala företag i 25 svenska städer, jämför dina alternativ och se vad andra tipsar om. Restauranger, frisörer, gym, hantverkare och mycket mer.",
  applicationName: "Tipsly",
  openGraph: {
    type: "website",
    locale: "sv_SE",
    siteName: "Tipsly",
  },
  formatDetection: { telephone: false },
  robots: INDEXABLE ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f4ef",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieCity = (await cookies()).get(CITY_COOKIE)?.value;
  const initialCity = isCity(cookieCity) ? cookieCity : DEFAULT_CITY;

  return (
    <html lang="sv" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <AppProviders initialCity={initialCity}>
          <a href="#innehall" className={styles.skipLink}>
            Hoppa till innehållet
          </a>
          <div className={styles.shell}>
            <DemoNotice />
            <SiteHeader />
            <main id="innehall" className={styles.main}>
              {children}
            </main>
            <SiteFooter />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
