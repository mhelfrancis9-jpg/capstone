import type { Metadata } from "next";
import { Open_Sans, Inter, Archivo, Instrument_Sans } from "next/font/google";
import { CartProvider } from "@/components/customer/CartContext";
import { ShopProvider } from "@/components/customer/ShopContext";
import "./globals.css";

// Design reference (Figma "Admin Page Prototype") uses the Open Sans family.
const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-open-sans",
  display: "swap",
});

// Fonts used by the customer-facing storefront sections (e.g. the
// "Build Your Own Custom Bike" promo block). Loaded alongside Open Sans;
// existing admin sections keep using --font-sans and are unaffected.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["900"],
  variable: "--font-archivo",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LnR Cycle Center",
  description:
    "LnR Cycle Center — motorcycle repair, parts and servicing. Administrator panel and booking system.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} ${inter.variable} ${archivo.variable} ${instrumentSans.variable}`}
    >
      <body>
        <ShopProvider>
          <CartProvider>{children}</CartProvider>
        </ShopProvider>
      </body>
    </html>
  );
}
