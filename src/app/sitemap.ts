import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.modclient.app';

// Fecha de última actualización del contenido de cada sección
const LAST_MODIFIED = new Date('2026-07-20');

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── HOME / LANDING ────────────────────────────────────────────────
    {
      url: BASE_URL,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: {
        languages: {
          en: `${BASE_URL}/en`,
          es: `${BASE_URL}/es`,
        },
      },
    },

    // ── AUTH PAGES ────────────────────────────────────────────────────
    // Indexables — ayudan a la crawleabilidad del dominio
    {
      url: `${BASE_URL}/login`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/login`,
          es: `${BASE_URL}/es/login`,
        },
      },
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly',
      priority: 0.5,
      alternates: {
        languages: {
          en: `${BASE_URL}/en/signup`,
          es: `${BASE_URL}/es/signup`,
        },
      },
    },

    // ── FUTURE PAGES (añadir cuando se implementen) ───────────────────
    // Descomentar a medida que se creen las páginas correspondientes:

    // Features
    // { url: `${BASE_URL}/features`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
    // { url: `${BASE_URL}/features/register-mapping`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.7 },
    // { url: `${BASE_URL}/features/bus-scanner`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.7 },
    // { url: `${BASE_URL}/features/automations`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.7 },
    // { url: `${BASE_URL}/features/frame-console`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.7 },

    // Compare pages (alto valor SEO)
    // { url: `${BASE_URL}/compare/qmodmaster`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
    // { url: `${BASE_URL}/compare/modbus-poll`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
    // { url: `${BASE_URL}/compare/modscan`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
    // { url: `${BASE_URL}/compare/node-red`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.7 },

    // Docs
    // { url: `${BASE_URL}/docs`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.7 },
    // { url: `${BASE_URL}/docs/getting-started`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.6 },
    // { url: `${BASE_URL}/docs/modbus-rtu-guide`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.6 },

    // Blog (añadir entradas dinámicamente cuando se implemente el blog)
    // { url: `${BASE_URL}/blog`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.6 },
  ];
}
