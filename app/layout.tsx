import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Inter_Tight,
  IM_Fell_English,
  Instrument_Serif,
  Shippori_Mincho_B1,
  Space_Grotesk,
  Titillium_Web,
  Yellowtail,
} from "next/font/google";
import { Cursor } from "@/components/Cursor";
import { PullChain } from "@/components/PullChain";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-sans" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });
const f1 = Titillium_Web({ subsets: ["latin"], weight: ["400", "700", "900"], style: ["normal", "italic"], variable: "--font-f1" });
const manga = Shippori_Mincho_B1({ weight: ["500", "800"], preload: false, variable: "--font-manga" });
const storybook = IM_Fell_English({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-storybook" });
const space = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-space" });
const winter = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "500"], style: ["normal", "italic"], variable: "--font-winter" });
const cali = Yellowtail({ subsets: ["latin"], weight: "400", variable: "--font-cali" });

export const metadata: Metadata = {
  title: "Ashrit Anala | Portfolio",
  description: "Software engineer and student at Vanderbilt University.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fonts = [sans, serif, f1, manga, storybook, space, winter, cali].map((f) => f.variable).join(" ");
  return (
    <html lang="en" className={fonts} suppressHydrationWarning>
      <head>
        {/* apply a saved theme before first paint (light unless the visitor chose dark) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light"}catch(e){}`,
          }}
        />
      </head>
      <body>
        <SmoothScroll />
        <PullChain />
        {children}
        <Cursor />
      </body>
    </html>
  );
}
