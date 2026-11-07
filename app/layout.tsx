import type { Metadata } from "next";
import { Cairo, Geist_Mono, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { I18nProvider } from "@/lib/i18n";
import { cookies } from "next/headers";
import { AdminEditFab } from "@/components/cms/admin-edit-fab";
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const token = (await cookies()).get(adminCookieName())?.value;
  const isAdmin = await isValidAdminSession(token);

  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${playfair.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans">
        <I18nProvider>
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <SiteFooter />
          {isAdmin ? <AdminEditFab /> : null}
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
