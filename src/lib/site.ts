const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

/** Public origin used for canonical URLs, Open Graph and the sitemap. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercelHost ? `https://${vercelHost}` : "http://localhost:3000");

/**
 * Search engines may index the site only once it runs on its real domain
 * (NEXT_PUBLIC_SITE_URL is set). Demo and preview deployments stay out of
 * search results, since they show fictional businesses and ratings.
 */
export const INDEXABLE = Boolean(process.env.NEXT_PUBLIC_SITE_URL);
