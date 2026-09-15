import type { Config } from '@netlify/functions'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { savedJokes } from '../../db/schema.js'

function visitor(request: Request) {
  const value = request.headers.get('x-visitor-id')?.trim()
  return value && /^[a-zA-Z0-9-]{12,80}$/.test(value) ? value : null
}

export default async (request: Request) => {
  const visitorId = visitor(request)
  if (!visitorId) return Response.json({ message: 'A valid visitor ID is required.' }, { status: 400 })

  if (request.method === 'GET') {
    const favorites = await db.select().from(savedJokes).where(eq(savedJokes.visitorId, visitorId)).orderBy(desc(savedJokes.savedAt))
    return Response.json({ favorites })
  }

  if (request.method === 'POST') {
    const body = await request.json() as Record<string, unknown>
    if (!Number.isInteger(body.id) || !['single', 'twopart'].includes(String(body.type))) {
      return Response.json({ message: 'That joke cannot be saved.' }, { status: 400 })
    }
    const [favorite] = await db.insert(savedJokes).values({
      visitorId,
      jokeApiId: Number(body.id),
      category: String(body.category ?? 'Misc').slice(0, 30),
      type: String(body.type),
      setup: body.setup ? String(body.setup).slice(0, 1200) : null,
      delivery: body.delivery ? String(body.delivery).slice(0, 1200) : null,
      joke: body.joke ? String(body.joke).slice(0, 2400) : null,
    }).onConflictDoNothing().returning()
    return Response.json({ favorite: favorite ?? null }, { status: 201 })
  }

  if (request.method === 'DELETE') {
    const id = Number(new URL(request.url).searchParams.get('id'))
    if (!Number.isInteger(id)) return Response.json({ message: 'A joke ID is required.' }, { status: 400 })
    await db.delete(savedJokes).where(and(eq(savedJokes.visitorId, visitorId), eq(savedJokes.jokeApiId, id)))
    return new Response(null, { status: 204 })
  }

  return Response.json({ message: 'Method not allowed' }, { status: 405 })
}

export const config: Config = { path: '/api/favorites' }
