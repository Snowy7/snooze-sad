# Required SEO Image Assets

This directory needs the following image assets for complete SEO and PWA support.

## Priority 1: Essential Assets

### 1. Open Graph Image
**Filename**: `og-image.png`  
**Size**: 1200 x 630 pixels  
**Format**: PNG  
**Purpose**: Social media preview when sharing links

**Design Guidelines**:
- Include the Snooze logo/branding
- Show a clean UI screenshot or hero visual
- Add tagline: "Stay Organized. Stay Focused. Stay in Flow."
- Use brand colors (blue primary #3b82f6)
- Ensure text is readable at small sizes
- Keep important content in center 1200x600 area (safe zone)

**Tools to Create**:
- Figma/Canva: Use template at 1200x630px
- Photoshop/GIMP: Export as PNG with 72 DPI
- Online: Use [og-image.xyz](https://og-image.xyz/) or similar

---

### 2. Favicon
**Filename**: `favicon.ico`  
**Sizes**: 16x16, 32x32, 48x48  
**Format**: ICO (multi-size)  
**Purpose**: Browser tab icon

**Design Guidelines**:
- Simple, recognizable icon (not full logo)
- Works at tiny sizes (16x16)
- High contrast
- Consider both light and dark backgrounds

**Tools to Create**:
- [Favicon.io](https://favicon.io/) - Generate from text/image
- [RealFaviconGenerator](https://realfavicongenerator.net/) - All-in-one

---

### 3. Apple Touch Icon
**Filename**: `apple-touch-icon.png`  
**Size**: 180 x 180 pixels  
**Format**: PNG  
**Purpose**: iOS home screen icon

**Design Guidelines**:
- iOS automatically rounds corners, add no corner radius
- 20% padding on all sides for optimal appearance
- High contrast, solid background
- No transparency (iOS adds its own background)
- Export at 180x180 px

---

## Priority 2: PWA Assets

### 4. PWA Icon - Small
**Filename**: `icon-192.png`  
**Size**: 192 x 192 pixels  
**Format**: PNG  
**Purpose**: Android home screen, PWA manifest

**Design Guidelines**:
- Same design as Apple Touch Icon
- 10% padding recommended
- Transparent or solid background
- Can include subtle shadows

---

### 5. PWA Icon - Large
**Filename**: `icon-512.png`  
**Size**: 512 x 512 pixels  
**Format**: PNG  
**Purpose**: High-res Android icon, splash screens

**Design Guidelines**:
- Scaled-up version of 192px icon
- Maintain exact proportions
- Export at highest quality

---

## Priority 3: Additional Recommended Assets

### 6. Twitter Card Image (Optional)
**Filename**: `twitter-card.png`  
**Size**: 1200 x 675 pixels (16:9 ratio)  
**Format**: PNG  
**Purpose**: Twitter-specific preview

**Note**: Currently using same as OG image, but 16:9 ratio is preferred for Twitter.

---

### 7. Alternative Favicons
**Optional additional files**:
- `favicon-16x16.png` - 16x16 PNG
- `favicon-32x32.png` - 32x32 PNG  
- `safari-pinned-tab.svg` - Monochrome SVG for Safari

---

## Quick Start Guide

### Option 1: Design Suite (Figma/Sketch)
1. Create artboard at 1200x1200px
2. Design your icon/logo in center 512x512px
3. Export variations:
   - Full frame (1200x630) → `og-image.png`
   - Center 512px → `icon-512.png`
   - Scale to 192px → `icon-192.png`
   - Scale to 180px → `apple-touch-icon.png`
   - Scale to 32px → Include in `favicon.ico`

### Option 2: Online Tools
1. **OG Image**: [og-image.xyz](https://og-image.xyz/)
2. **Favicons**: [RealFaviconGenerator.net](https://realfavicongenerator.net/)
3. **PWA Icons**: [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)

### Option 3: Quick Template
```bash
# If you have a square logo (logo.png) at 1024x1024:

# Using ImageMagick
convert logo.png -resize 512x512 icon-512.png
convert logo.png -resize 192x192 icon-192.png  
convert logo.png -resize 180x180 apple-touch-icon.png
convert logo.png -resize 32x32 favicon-32.png
convert logo.png -resize 16x16 favicon-16.png

# Create ICO from multiple sizes
convert favicon-16.png favicon-32.png favicon.ico

# For OG Image (requires adding text/background)
convert logo.png -resize 600x600 \
  -background "#ffffff" -gravity center \
  -extent 1200x630 og-image-base.png
# Then add text in editor of choice
```

---

## Validation Checklist

After creating images, validate:

- [ ] All files in `/public` directory
- [ ] Correct dimensions and formats
- [ ] File sizes optimized (< 1MB for OG image)
- [ ] Icons look good on light and dark backgrounds
- [ ] Test OG image: [OpenGraph.xyz](https://www.opengraph.xyz/)
- [ ] Test favicons: Check in multiple browsers
- [ ] Test Apple icon: Add to iOS home screen
- [ ] PWA icons: Test manifest in Chrome DevTools

---

## Current Status

### ✅ Already Configured
- Metadata pointing to all image paths
- Web manifest with icon references
- Open Graph tags
- Apple touch icon link

### ⚠️ Needs Creation
- All image assets listed above

---

## File Size Guidelines

- `og-image.png`: 200-500 KB (compress with TinyPNG)
- `icon-512.png`: 50-100 KB
- `icon-192.png`: 15-30 KB
- `apple-touch-icon.png`: 15-30 KB
- `favicon.ico`: 5-15 KB

---

## Brand Colors Reference

Use these Snooze brand colors:

- **Primary Blue**: `#3b82f6` (RGB: 59, 130, 246)
- **Background Light**: `#ffffff` (RGB: 255, 255, 255)
- **Background Dark**: `#0a0a0a` (RGB: 10, 10, 10)
- **Text Dark**: `#0a0a0a` (RGB: 10, 10, 10)
- **Text Light**: `#fafafa` (RGB: 250, 250, 250)

---

## Support

For questions or assistance with asset creation:
1. Check the main `SEO_SETUP.md` documentation
2. Review Next.js metadata documentation
3. Contact the design team

**Last Updated**: October 3, 2025



