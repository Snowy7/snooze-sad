# Quick Start: SEO Setup

**Status**: ✅ Complete (pending image assets)

## What Was Done

✅ **Complete SEO infrastructure** for Snooze productivity app:
- Meta tags, Open Graph, Twitter Cards on all pages
- XML Sitemap at `/sitemap.xml`
- Robots.txt at `/robots.txt`
- PWA Web Manifest
- Structured data (Schema.org)
- Security headers
- Performance optimizations

## Immediate Next Steps

### 1. Create Image Assets (Required)

Create these 5 images (see `public/README_ASSETS.md` for details):

```
public/
  ├── og-image.png (1200x630px)
  ├── favicon.ico (16x16, 32x32, 48x48)
  ├── apple-touch-icon.png (180x180px)
  ├── icon-192.png (192x192px)
  └── icon-512.png (512x512px)
```

**Quick creation tools**:
- [Favicon Generator](https://realfavicongenerator.net/)
- [OG Image Template](https://og-image.xyz/)

### 2. Test Locally

```bash
# Build and run production mode
npm run build
npm start

# In another terminal, verify SEO
npm run verify-seo
```

### 3. Deploy to Production

After deployment:

```bash
# Verify production
npm run verify-seo:prod
```

### 4. Submit to Search Engines

1. **Google Search Console**: [search.google.com/search-console](https://search.google.com/search-console)
   - Add property: `snooze.app`
   - Submit sitemap: `https://snooze.app/sitemap.xml`

2. **Bing Webmaster**: [bing.com/webmasters](https://www.bing.com/webmasters)
   - Add site
   - Submit sitemap

## Test Your SEO

### Before Launch
- [ ] Create all 5 image assets
- [ ] Run `npm run verify-seo` locally
- [ ] Check meta tags in browser dev tools
- [ ] Test sitemap: `http://localhost:3000/sitemap.xml`

### After Launch
- [ ] Test OG tags: [opengraph.xyz](https://www.opengraph.xyz/)
- [ ] Test Twitter Cards: [Twitter Validator](https://cards-dev.twitter.com/validator)
- [ ] Test structured data: [Rich Results](https://search.google.com/test/rich-results)
- [ ] Test mobile: [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [ ] Test speed: [PageSpeed Insights](https://pagespeed.web.dev/)

## Files Changed

### Created
- `src/app/sitemap.ts` - Dynamic XML sitemap
- `src/app/robots.ts` - Robots.txt configuration
- `src/app/contact/layout.tsx` - Contact page metadata
- `src/app/(auth)/auth/layout.tsx` - Auth page metadata
- `public/site.webmanifest` - PWA manifest
- `public/.well-known/security.txt` - Security contact
- `scripts/verify-seo.js` - SEO verification script

### Modified
- `src/app/layout.tsx` - Root metadata configuration
- `src/app/page.tsx` - Landing page SEO + structured data
- `src/app/privacy/page.tsx` - Privacy page metadata
- `src/app/terms/page.tsx` - Terms page metadata
- `next.config.ts` - Performance + security headers
- `package.json` - Added verify-seo scripts

### Documentation
- `SEO_SETUP.md` - Comprehensive guide
- `SEO_IMPLEMENTATION_SUMMARY.md` - Detailed summary
- `public/README_ASSETS.md` - Image creation guide
- `QUICK_START_SEO.md` - This file

## Verification Commands

```bash
# Local development
npm run dev
npm run verify-seo

# Production build
npm run build
npm start
npm run verify-seo

# Production site
npm run verify-seo:prod
```

## Key URLs

After deployment:
- Landing: `https://snooze.app`
- Sitemap: `https://snooze.app/sitemap.xml`
- Robots: `https://snooze.app/robots.txt`
- Manifest: `https://snooze.app/site.webmanifest`

## Need Help?

📖 **Detailed Documentation**:
- `SEO_SETUP.md` - Full SEO guide
- `SEO_IMPLEMENTATION_SUMMARY.md` - What was implemented
- `public/README_ASSETS.md` - Image specifications

🔍 **Testing Tools**:
- Local verification: `npm run verify-seo`
- Online OG testing: [opengraph.xyz](https://www.opengraph.xyz/)
- Twitter Cards: [Twitter Validator](https://cards-dev.twitter.com/validator)

## Expected Results

### Week 1
- Pages indexed by Google
- Sitemap processed
- Brand searches work

### Month 1
- 50-100 organic visitors/month
- Long-tail keywords ranking
- Social previews working

### Month 3
- 200-500 organic visitors/month
- Multiple keywords ranking
- Growing search presence

## Troubleshooting

**Q: Sitemap 404 error?**  
A: Run `npm run build` - Next.js generates dynamic routes at build time

**Q: Meta tags not showing?**  
A: Check browser dev tools → View Page Source → Search for `<meta`

**Q: OG preview not updating?**  
A: Clear cache at [opengraph.xyz](https://www.opengraph.xyz/) or wait 24-48 hours

**Q: Images not loading?**  
A: Ensure images are in `/public` directory with correct names

---

**Ready?** Create the 5 images and deploy! 🚀

**Last Updated**: October 3, 2025

