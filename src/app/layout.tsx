import type { Metadata } from 'next';
import { getLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const BASE_URL = 'https://www.modclient.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'modclient — Free Online Modbus RTU Testing Tool',
    template: '%s | modclient',
  },
  description:
    'Test Modbus RTU devices directly from your browser. Free online Modbus client with real-time register mapping, bus scanner, and automation sequences. No installation required. Works in Chrome & Edge.',
  keywords: [
    'modbus testing tool',
    'modbus client online',
    'modbus RTU software',
    'free modbus master',
    'modbus register reader',
    'RS485 testing tool',
    'modbus slave scanner',
    'browser modbus client',
    'QModMaster alternative',
    'Modbus Poll alternative',
    'online modbus diagnostic',
    'modbus automation tool',
    'web serial modbus',
    'herramienta modbus online',
    'modbus RTU online',
    'modbus USB RS485',
  ],
  authors: [{ name: 'modclient', url: BASE_URL }],
  creator: 'modclient',
  publisher: 'modclient',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'modclient — Free Online Modbus RTU Testing Tool',
    description:
      'Test Modbus RTU devices directly from your browser. Real-time register mapping, bus scanner, and automation sequences. No installation required.',
    type: 'website',
    url: BASE_URL,
    siteName: 'modclient',
    locale: 'en_US',
    alternateLocale: ['es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'modclient — Free Online Modbus RTU Testing Tool',
    description:
      'Test Modbus RTU devices directly from your browser. No installation required.',
    creator: '@modclient',
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'en': `${BASE_URL}/en`,
      'es': `${BASE_URL}/es`,
    },
  },
  category: 'technology',
};

// Schema.org JSON-LD: SoftwareApplication
const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'modclient',
  url: BASE_URL,
  description:
    'Free online Modbus RTU testing tool. Read and write registers, scan the RS485 bus, and automate sequences — directly from your browser without installing any software.',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Chrome, Edge (Web Browser)',
  offers: [
    {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      name: 'Technician Free',
    },
    {
      '@type': 'Offer',
      price: '4.99',
      priceCurrency: 'EUR',
      name: 'Engineering Pro',
    },
    {
      '@type': 'Offer',
      price: '16.99',
      priceCurrency: 'EUR',
      name: 'Industrial Elite',
    },
  ],
  featureList: [
    'Real-time Modbus register mapping',
    'RS485 bus slave scanner',
    'Automated test sequences',
    'Raw frame hex console with CRC validation',
    'No installation required',
    'Works in Chrome and Edge via Web Serial API',
  ],
  screenshot: `${BASE_URL}/og-image.png`,
};

// Schema.org JSON-LD: FAQPage
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is modclient?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'modclient is a free online Modbus RTU testing tool that runs directly in your browser (Chrome or Edge). It allows you to read and write registers, scan the RS485 bus, and automate test sequences without installing any desktop software.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to install any software to use modclient?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No installation is required. modclient uses the Web Serial API built into modern browsers (Chrome 89+ and Edge 89+) to communicate directly with USB-RS485 converters.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is modclient a free Modbus tool?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. modclient offers a free plan with no time limit that includes register access, the frame console, and basic automations. Paid plans (Pro and Industrial Elite) unlock advanced features like unlimited projects, auto-polling, and CSV/JSON export.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is modclient an alternative to QModMaster or Modbus Poll?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. modclient provides similar core functionality to QModMaster, Modbus Poll, and ModScan — but runs entirely in the browser. This means it works on any operating system (Windows, macOS, Linux) without requiring installation or a license purchase.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which USB-RS485 adapters are compatible?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'modclient works with any USB-RS485 converter that exposes a virtual serial port and is supported by the Web Serial API. Common compatible adapters include those based on FTDI FT232, CH340, CP2102, and Prolific PL2303 chipsets.',
      },
    },
  ],
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
        {/* hreflang — language targeting */}
        <link rel="alternate" hrefLang="en" href={`${BASE_URL}/en`} />
        <link rel="alternate" hrefLang="es" href={`${BASE_URL}/es`} />
        <link rel="alternate" hrefLang="x-default" href={BASE_URL} />
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
