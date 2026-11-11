import type { Metadata } from "next";
import { Cairo, Geist_Mono, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { I18nProvider } from "@/lib/i18n";
import { cookies } from "next/headers";
import { AppTheme } from "@/components/app-theme";
import { PromoPopup } from "@/components/promo-popup";
import { StatusFlashHost } from "@/components/status-flash";
import { WhatsAppBubble } from "@/components/layout/whatsapp-bubble";
import { CartPreview } from "@/components/layout/cart-preview";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { EditProvider } from "@/lib/edit-context";
import { getSite } from "@/lib/local-db";
import { adminCookieName, isValidAdminSession } from "@/lib/admin-auth";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-inter",
  subsets: ["arabic", "latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Boo — Oxford Atelier",
  description: "تيشيرت، مج حراري، وكوستر خشب. كل قطعة بـ ١٠٠ جنيه.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  let isAdmin = false;
  try {
    const token = (await cookies()).get(adminCookieName())?.value;
    isAdmin = await isValidAdminSession(token);
  } catch {
    isAdmin = false;
  }
  const site = await getSite();

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} ${playfair.variable} ${geistMono.variable} flex min-h-full flex-col font-sans`}>
        <AppTheme>
          <I18nProvider>
            <EditProvider initial={site} isAdmin={isAdmin}>
              <SiteHeader />
              <main className="flex flex-1 flex-col pb-16 md:pb-0">{children}</main>
              <SiteFooter />
              <PromoPopup />
              <WhatsAppBubble />
              <CartPreview />
              <MobileBottomNav />
              <StatusFlashHost />
              <Toaster />
            </EditProvider>
          </I18nProvider>
        </AppTheme>
      </body>
    </html>
  );
}
