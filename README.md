# Tokee

A modern service status dashboard built with **Astro** (static), **Svelte islands**, and **Tailwind CSS v4**. Monitor data is fetched **client-side** from the UptimeRobot Stats API.

## Stack

- Astro static output (`/`, `/monitors?id=…`, `/404`)
- Svelte 5 islands for interactive UI
- Tailwind CSS v4 (CSS-first)
- Swup page transitions (RC-Blog-aligned shell)

## Configuration

Edit `src/config.ts`:

```typescript
export const siteConfig = {
  // UptimeRobot public status page id
  pageId: 'your-statuspage-id',
  // Optional: auto-refresh monitors (seconds)
  autoRefresh: {
    enable: true,
    interval: 300,
  },
  // ...
};

export const navBarConfig = {
  links: [
    // Only links with non-empty `url` are shown
    { name: 'Blog', url: 'https://example.com' },
  ],
};
```

## Scripts

```bash
pnpm install
pnpm dev      # http://127.0.0.1:7210
pnpm build
pnpm preview
pnpm check
```

## Notes

- High-timeliness UptimeRobot data is always fetched in the browser (not at build time).
- Detail route uses query params: `/monitors?id=123` (no `[id].astro` / `getStaticPaths`).
- Icons use `@iconify/svelte` only.
