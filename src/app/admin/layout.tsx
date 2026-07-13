import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { AdminShell } from "@/components/admin/shell";
import { RequireAuth } from "@/components/auth/require-auth";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Console · DB Plus",
    template: "%s · DB Plus Console",
  },
  // The console is private tooling — never indexed (robots.ts blocks /admin too).
  robots: { index: false, follow: false },
};

/**
 * The DB Plus Console — its own chrome (no public header/footer), Meridian
 * fonts, slate UI. RequireAuth validates the session against GET /auth/me
 * before the console renders; the proxy's cookie gate is only the first,
 * cheap line of defence.
 */
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${hanken.variable} ${jetbrains.variable} font-admin min-h-screen bg-console-page text-[14px] leading-[1.5] text-ink antialiased`}
    >
      <RequireAuth>
        <AdminShell>{children}</AdminShell>
      </RequireAuth>
    </div>
  );
}
