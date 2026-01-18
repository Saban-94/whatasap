import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script"; // מייבאים את רכיב הסקריפט של Next

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ח.סבן - מערכת ניהול",
  description: "אפליקציית ניהול הזמנות ומכולות",
  manifest: "/manifest.json", // חשוב ל-PWA
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        {/* טעינת SDK של OneSignal */}
        <Script 
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" 
          strategy="afterInteractive"
        />
        {/* הגדרת OneSignal עם ה-App ID שלך */}
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "546472ac-f9ab-4c6c-beb2-e41c72af9849",
                safari_web_id: "web.onesignal.auto.195e7e66-9dea-4e11-b56c-b4a654da5ab7",
                notifyButton: {
                  enable: true,
                },
                allowLocalhostAsSecureOrigin: true, // מאפשר בדיקה במחשב האישי
              });
            });
          `}
        </Script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
