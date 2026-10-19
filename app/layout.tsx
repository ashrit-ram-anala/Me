import type { Metadata } from "next";
import {
  Archivo,
  Cormorant_Garamond,
  Fraunces,
  Inter_Tight,
  Instrument_Serif,
  Space_Grotesk,
  Titillium_Web,
} from "next/font/google";
import { Cursor } from "@/components/Cursor";
import { Scrollbar } from "@/components/Scrollbar";
import { PullChain } from "@/components/PullChain";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-sans" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });
const f1 = Titillium_Web({ subsets: ["latin"], weight: ["400", "700", "900"], style: ["normal", "italic"], variable: "--font-f1" });
// the Monster logo's extra-wide black caps and its condensed caption line, from one width axis
const monster = Archivo({ subsets: ["latin"], axes: ["wdth"], preload: false, variable: "--font-monster" });
const space = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-space" });
const winter = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "500"], style: ["normal", "italic"], variable: "--font-winter" });
// soft, rounded 70s California serif for the golden-hour boulevard
const cali = Fraunces({ subsets: ["latin"], style: ["italic"], axes: ["SOFT", "WONK"], preload: false, variable: "--font-cali" });

export const metadata: Metadata = {
  title: "Ashrit Anala | Portfolio",
  description: "Software engineer and student at Vanderbilt University.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fonts = [sans, serif, f1, monster, space, winter, cali].map((f) => f.variable).join(" ");
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
        <Scrollbar />
        <Cursor />
      </body>
    </html>
  );
}
