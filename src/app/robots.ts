import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.modclient.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Permite crawling de todas las páginas públicas
        userAgent: '*',
        allow: '/',
        disallow: [
          '/console',      // App privada — no indexar
          '/api/',         // Endpoints API — no indexar
          '/auth/',        // Callbacks OAuth — no indexar
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
