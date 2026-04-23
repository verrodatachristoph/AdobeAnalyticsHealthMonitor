import { TooltipProvider } from "@/components/ui/tooltip";
import { loadTheme } from "@/lib/queries/preferences";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adobe Analytics Health Monitor",
  description: "Observability for Adobe Analytics implementations.",
};

// Inline script to set the theme attribute BEFORE hydration so there's no
// flash of unstyled content. Reads the server-rendered initial theme; if
// "system", checks prefers-color-scheme.
const themeBootstrap = `
(function(){
  try {
    var server = document.documentElement.dataset.theme;
    if (!server || server === 'system') {
      var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    }
  } catch (_) {}
})();
`.trim();

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await loadTheme();

  return (
    <html lang="en" data-theme={theme} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-dvh bg-field text-primary antialiased">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
