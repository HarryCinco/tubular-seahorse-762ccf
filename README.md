<img width="1920" height="843" alt="Screenshot 2026-09-15 100132" src="https://github.com/user-attachments/assets/795fbbbc-9153-4da2-9980-90c6b626be86" />

# The Daily Punch

The Daily Punch is a full-stack joke discovery app. It serves fresh, unhinged material from the free [JokeAPI](https://v2.jokeapi.dev/) and lets visitors build a persistent personal archive of favorites.

## Technology

- TanStack Start and React 19
- Netlify Functions for the public API proxy and favorites endpoints
- Netlify Database with Drizzle ORM for saved jokes
- Tailwind CSS tooling with a custom responsive design system

## Local development

Install dependencies with `pnpm install`, then run `netlify dev --port 8889`. Netlify Dev provides the function routing and database environment used by the application. Database migrations in `netlify/database/migrations` are applied by Netlify when deployed.

The JokeAPI integration needs no API key. Safe mode is always enabled by the server-side proxy.
