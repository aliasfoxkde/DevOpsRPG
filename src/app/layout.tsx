import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/hooks/useTheme';
import { AuthProvider } from '@/hooks/useAuth';
import { ProgressProvider } from '@/hooks/useProgress';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DevOpsQuest - Gamified DevOps Learning',
  description: 'Learn DevOps skills through an interactive RPG-style experience. Master HTML, CSS, JavaScript, Python, and more with XP, achievements, and career paths.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-512.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DevOpsQuest',
  },
  openGraph: {
    title: 'DevOpsQuest - Gamified DevOps Learning',
    description: 'Learn DevOps skills through an interactive RPG-style experience',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4f46e5' },
    { media: '(prefers-color-scheme: dark)', color: '#6366f1' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <ProgressProvider>
              {children}
            </ProgressProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
