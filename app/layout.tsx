import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adobe Analytics Health Monitor",
  description: "Observability for Adobe Analytics implementations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-field text-primary antialiased">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
