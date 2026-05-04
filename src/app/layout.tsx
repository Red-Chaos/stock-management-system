import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './providers';
import { ThemeProvider } from './ThemeProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Stock Management System',
  description: 'Corporate Stock Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              if (localStorage.theme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
              }
            } catch (_) {}
          `
        }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
