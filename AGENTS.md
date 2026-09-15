# Project guide

## Architecture

The Daily Punch is a TanStack Start application deployed on Netlify. The main product view lives in `src/routes/index.tsx`, the document shell and metadata live in `src/routes/__root.tsx`, and the complete visual system is in `src/styles.css`.

Server-side endpoints are Netlify Functions in `netlify/functions`. `jokes.mts` validates filter input and proxies JokeAPI with safe mode enabled. `favorites.mts` provides GET, POST, and DELETE operations against Netlify Database. The browser creates a persistent anonymous visitor UUID and sends it in the `x-visitor-id` header, so favorites remain scoped without requiring account creation.

The Drizzle schema and client are in `db/`. Every schema change must be followed by a descriptive `pnpm drizzle-kit generate --name ...` command so the matching migration is placed in `netlify/database/migrations`.

## Conventions

- Use TypeScript and standard Web Request/Response APIs in functions.
- Keep third-party API responses normalized at the server boundary.
- Validate all client-provided identifiers and cap saved text lengths.
- Preserve the editorial newspaper aesthetic, warm print palette, responsive behavior, keyboard focus states, and reduced-motion support.
- Add interaction-specific loading, empty, and error states rather than relying on global spinners or alerts.
- Use `pnpm` for dependency management.
