import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Web Serial API - no special Next.js config needed
  // but we disable strict mode for serial port compatibility
  reactStrictMode: false,
};

export default withNextIntl(nextConfig);
