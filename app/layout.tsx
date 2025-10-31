import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AgentChatProvider } from '@/lib/contexts/AgentChatContext';

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Personal Developer Dashboard',
  description: 'Track projects, commits, and language trends at a glance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetBrainsMono.variable} font-mono`}>
        <ThemeProvider>
          <QueryProvider>
            <AgentChatProvider>{children}</AgentChatProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
