# SEO Setup for Snooze

This document outlines the comprehensive SEO setup implemented for the Snooze productivity application.

## Overview

All SEO configurations follow Next.js 15 best practices and include:
- Meta tags (title, description, keywords)
- Open Graph tags for social media sharing
- Twitter Card metadata
- Structured data (JSON-LD)
- XML sitemap
- robots.txt configuration
- Web manifest for PWA support

## Base Configuration

### Root Layout (`src/app/layout.tsx`)
- **metadataBase**: `https://snooze.app`
- **Title Template**: `%s | Snooze`
- **Default Title**: "Snooze - Stay Organized. Stay Focused. Stay in Flow."
- **Open Graph**: Configured with images, locale, and site information
- **Twitter Cards**: Large image cards enabled
- **Robots**: Configured to allow indexing with optimal preview settings

## Page-Specific SEO

### Landing Page (`src/app/page.tsx`)
- Complete meta tags with productivity-focused keywords
- Structured data (Schema.org SoftwareApplication)
- Open Graph and Twitter card metadata
- Canonical URL

### Contact Page (`src/app/contact/`)
- Separate layout file for metadata (client component workaround)
- Contact-specific keywords and description

### Privacy Policy (`src/app/privacy/page.tsx`)
- Privacy and security-focused metadata
- Proper legal page indexing

### Terms of Service (`src/app/terms/page.tsx`)
- Terms and legal-focused metadata
- User agreement keywords

## Technical SEO Files

### Sitemap (`src/app/sitemap.ts`)
Location: `https://snooze.app/sitemap.xml`

Includes all public pages with proper priority and change frequency:
- Landing page (priority: 1.0, weekly updates)
- Auth pages (priority: 0.9, monthly updates)
- App pages (priority: 0.7-0.8, daily updates)
- Legal pages (priority: 0.5, monthly updates)

### Robots.txt (`src/app/robots.ts`)
Location: `https://snooze.app/robots.txt`

Configuration:
- Allows all user agents to crawl public pages
- Blocks private/authenticated areas:
  - `/api/`
  - `/callback/`
  - `/invitations/`
  - `/dashboard/`
  - `/projects/`
  - All authenticated routes
- References sitemap for crawler discovery

### Web Manifest (`public/site.webmanifest`)
Location: `https://snooze.app/site.webmanifest`

PWA configuration:
- App name and description
- Theme colors
- Icons (192x192, 512x512)
- Standalone display mode

## Structured Data

The landing page includes Schema.org structured data:
- Type: `SoftwareApplication`
- Category: `ProductivityApplication`
- Pricing information
- Aggregate rating (placeholder)
- Application description

## Required Assets

You need to create the following image assets:

### Open Graph Image
- **Path**: `/public/og-image.png`
- **Size**: 1200x630 pixels
- **Format**: PNG
- **Content**: Should showcase Snooze's interface and value proposition

### Favicon
- **Path**: `/public/favicon.ico`
- **Sizes**: 16x16, 32x32, 48x48
- **Format**: ICO

### Apple Touch Icon
- **Path**: `/public/apple-touch-icon.png`
- **Size**: 180x180 pixels
- **Format**: PNG

### PWA Icons
- **Path**: `/public/icon-192.png` (192x192 pixels)
- **Path**: `/public/icon-512.png` (512x512 pixels)
- **Format**: PNG

## Keywords Strategy

### Primary Keywords
- productivity app
- task management
- project management
- focus timer
- pomodoro technique

### Secondary Keywords
- habit tracker
- kanban board
- time tracking
- work organization
- productivity tool

### Long-tail Keywords
- daily task manager with focus timer
- project management with pomodoro
- habit tracking productivity app

## Social Media Optimization

### Open Graph Tags
All pages include Open Graph metadata for rich social media previews on:
- Facebook
- LinkedIn
- Slack
- Discord

### Twitter Cards
Large image cards configured for optimal Twitter sharing.

## Performance Considerations

- All metadata is static and generated at build time
- Sitemap is dynamically generated but cached
- robots.txt is optimized for crawler efficiency
- No blocking resources in SEO configuration

## Monitoring & Analytics

### Recommended Tools
1. **Google Search Console**: Monitor indexing and search performance
2. **Bing Webmaster Tools**: Track Bing/Yahoo search presence
3. **Google Analytics**: Track user behavior and conversions
4. **Ahrefs/SEMrush**: Monitor keyword rankings and backlinks

### Key Metrics to Track
- Organic search traffic
- Keyword rankings
- Click-through rate (CTR)
- Bounce rate
- Time on page
- Conversion rate

## Testing Your SEO

### Before Launch Checklist
- [ ] All images created (OG image, favicons, PWA icons)
- [ ] Verify sitemap accessibility: `https://snooze.app/sitemap.xml`
- [ ] Verify robots.txt: `https://snooze.app/robots.txt`
- [ ] Test Open Graph tags: [OpenGraph.xyz](https://www.opengraph.xyz/)
- [ ] Test Twitter Cards: [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Validate structured data: [Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Check mobile-friendliness: [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [ ] Verify page speed: [PageSpeed Insights](https://pagespeed.web.dev/)

### Post-Launch Actions
1. Submit sitemap to Google Search Console
2. Submit sitemap to Bing Webmaster Tools
3. Set up Google Analytics 4
4. Configure conversion tracking
5. Monitor indexing status weekly
6. Review and update meta descriptions quarterly
7. Refresh structured data as features change

## Content Optimization

### Best Practices
- Keep titles under 60 characters
- Keep descriptions between 150-160 characters
- Use action-oriented language
- Include primary keywords naturally
- Maintain consistent branding

### Current Titles (Character Count)
- Landing: "Snooze - Stay Organized. Stay Focused. Stay in Flow." (54 chars) ✓
- Contact: "Contact Us | Snooze" (19 chars) ✓
- Privacy: "Privacy Policy | Snooze" (23 chars) ✓
- Terms: "Terms of Service | Snooze" (25 chars) ✓

## Local Development Testing

To test SEO in development:

```bash
npm run build
npm start
```

Then visit:
- http://localhost:3000/sitemap.xml
- http://localhost:3000/robots.txt
- http://localhost:3000 (view page source to see meta tags)

## Future Enhancements

### Planned Improvements
1. Blog section for content marketing
2. FAQ page with schema markup
3. Case studies/testimonials with review schema
4. Video content with VideoObject schema
5. Multilingual support with hreflang tags
6. Dynamic OG images per project/user
7. AMP pages for blog content
8. Breadcrumb navigation with BreadcrumbList schema

### Advanced SEO Features
- Dynamic sitemap for user-generated content
- Image sitemaps
- Video sitemaps
- News sitemap (if blog is added)
- RSS feed
- Accelerated Mobile Pages (AMP)

## Compliance

### Privacy & Legal
- GDPR-compliant privacy policy
- Cookie consent (to be implemented)
- Terms of service clearly accessible
- Contact information readily available

### Accessibility
- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance (WCAG 2.1 AA)

## Support & Resources

### Official Documentation
- [Next.js Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)

### Questions?
If you have questions about the SEO setup, please contact the development team or refer to the Next.js documentation.

---

**Last Updated**: October 3, 2025
**Version**: 1.0
**Maintained by**: Snooze Development Team

