'use client';

import Script from "next/script";

/**
 * Anti-FOUC (Flash of Unstyled Content) theme script.
 * Runs before paint to read localStorage/system preference and set data-theme on <html>.
 * Must be a client component to use Next.js Script component.
 */
export function ThemeScript() {
  const themeScript = `(function(){try{var s=localStorage.getItem('cg.theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=s||(m?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

  return <Script strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
