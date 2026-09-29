# IT'S GIVING — website refresh

A ground-up redesign concept for [itsgivingdrinks.com](https://www.itsgivingdrinks.com/): gut-friendly soda with 6g of fibre, £1 a can.

**Live preview:** https://andrewgunn.github.io/itsgiving/

## What's in it

- **Flavour-switching hero.** The page recolours itself for Mango, Apple and Black Cherry, with rising bubbles, a tilt-on-hover can and a giant flavour word behind it.
- **The fibre story.** Animated stats (30g needed, 96% fall short, 6g per can) and a daily-fibre meter.
- **Shop.** Product cards with quantity steppers and a slide-out basket. Checkout sends people straight to the live Shopify checkout through cart permalinks (`/cart/{variantId}:{qty}`), so orders go through the existing store.
- What's inside, the £1 value section, a social gallery, FAQs, a stockist call-to-action and a newsletter sign-up (posts to the Shopify customer form).
- Responsive down to 320px. Respects `prefers-reduced-motion`.

## Stack

Plain HTML, CSS and vanilla JS with no build step. Fonts are Bricolage Grotesque and Instrument Sans from Google Fonts. Images are the brand's own photography, converted to WebP.

```
index.html
assets/css/styles.css
assets/js/main.js
assets/img/
```

Run it locally with `python3 -m http.server` and open http://localhost:8000.

## Taking it live

This is a static front-end that talks to the existing Shopify store. It can go live in either of these ways:

1. **Port it into a Shopify theme.** Recommended: this keeps the native cart, account and SEO. The sections map almost one-to-one onto Online Store 2.0 sections.
2. **Host it as-is** (Netlify, Vercel or Pages) on the main domain and keep Shopify for checkout only.

Variant IDs are hard-coded in the `data-add` attributes in `index.html`. Update them if products change in Shopify.
