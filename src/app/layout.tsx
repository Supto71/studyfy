import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Studyfy — Your Knowledge. Your Space.",
  description:
    "Your notes, documents and important work, organized in one personal cloud workspace.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Studyfy",
  },
};

export const viewport: Viewport = {
  themeColor: "#153E31",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen bg-[#F4F3EE] text-[#111827] antialiased selection:bg-[#153E31] selection:text-white"
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(regs) {
                    var hadSw = regs.length > 0;
                    Promise.all(regs.map(function(r) { return r.unregister(); })).then(function() {
                      if ('caches' in window) {
                        caches.keys().then(function(keys) {
                          Promise.all(keys.map(function(k) { return caches.delete(k); })).then(function() {
                            if (hadSw) {
                              location.reload();
                            }
                          });
                        });
                      }
                    });
                  });
                }
              }
            `,
          }}
        />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
