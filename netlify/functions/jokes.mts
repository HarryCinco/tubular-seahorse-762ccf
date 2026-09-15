import type { Config } from '@netlify/functions'

const allowedCategories = new Set(['Any', 'Programming', 'Misc', 'Pun', 'Spooky', 'Christmas'])
const allowedTypes = new Set(['Any', 'single', 'twopart'])

export default async (request: Request) => {
  if (request.method !== 'GET') return Response.json({ message: 'Method not allowed' }, { status: 405 })

  const incoming = new URL(request.url).searchParams
  const category = allowedCategories.has(incoming.get('category') ?? '') ? incoming.get('category')! : 'Any'
  const type = allowedTypes.has(incoming.get('type') ?? '') ? incoming.get('type')! : 'Any'
  const params = new URLSearchParams({ amount: '6', 'safe-mode': '' })
  if (type !== 'Any') params.set('type', type)

  try {
    const response = await fetch(`https://v2.jokeapi.dev/joke/${category}?${params}`)
    if (!response.ok) throw new Error('JokeAPI did not respond successfully')
    const data = await response.json()
    const jokes = (data.jokes ?? [data]).filter((joke: { error?: boolean }) => !joke.error).map((item: Record<string, unknown>) => ({
      id: item.id,
      category: item.category,
      type: item.type,
      setup: item.setup ?? null,
      delivery: item.delivery ?? null,
      joke: item.joke ?? null,
    }))
    return Response.json({ jokes, source: 'JokeAPI' })
  } catch {
    return Response.json({ message: 'The writers’ room is quiet right now. Try again in a moment.' }, { status: 502 })
  }
}

export const config: Config = { path: '/api/jokes' }
