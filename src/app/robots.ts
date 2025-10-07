import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://snooze.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/callback/',
          '/invitations/',
          '/_next/',
          '/dashboard/',
          '/projects/',
          '/daily/',
          '/focus/',
          '/habits/',
          '/notes/',
          '/calendar/',
          '/analytics/',
          '/settings/',
          '/workspaces/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}




