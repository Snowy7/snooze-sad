import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://snooze.app'
  const currentDate = new Date()

  // Add other public pages here
  const publicPages = [
    '/features',
    '/pricing',
    '/changelog',
    '/contact',
    '/blog',
    '/docs',
    '/privacy',
    '/terms',
    '/cookies',
  ]

  const pageEntries = publicPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as 'monthly',
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...pageEntries,
  ]
}




