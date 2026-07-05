import type { Metadata } from 'next';
import { getLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'modclient — Modbus RTU Console',
    template: '%s | modclient',
  },
  description:
    'Professional Modbus RTU engineering console. Control USB-RS485 devices directly from your browser. Read/write registers, automate sequences, scan the bus.',
  keywords: ['modbus', 'rtu', 'rs485', 'serial', 'usb', 'engineering', 'console', 'web serial'],
  authors: [{ name: 'modclient.com' }],
  openGraph: {
    title: 'modclient — Modbus RTU Console',
    description: 'Professional browser-based Modbus RTU engineering console.',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
