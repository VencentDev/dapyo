import type { Metadata } from 'next';
import { Figtree, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';

import { Navbar } from '@/components/navbar';
import { Providers } from '@/components/providers';
import { ThemeProvider } from '@/components/theme-provider';
import { siteConfig } from '@/config/site';

import '@/styles/globals.css';

const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree' });
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: siteConfig.metadataTitle,
  description: siteConfig.metadataDescription,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${figtree.variable} ${geistMono.variable} font-display`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <Navbar />
            <div className="mx-auto max-w-[1200px] px-4 py-6">{children}</div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
