import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  // Read locale from cookie, default to 'es'
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value ?? 'es';
  const validLocales = ['es', 'en'];
  const resolvedLocale = validLocales.includes(locale) ? locale : 'es';

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  };
});
