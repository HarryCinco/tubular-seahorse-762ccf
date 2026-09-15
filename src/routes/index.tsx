import { createFileRoute } from '@tanstack/react-router'
import { Bookmark, Check, ChevronRight, Laugh, RefreshCw, Sparkles, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

export const Route = createFileRoute('/')({ component: PunchlineDesk })

type Joke = { id: number; category: string; type: 'single' | 'twopart'; setup: string | null; delivery: string | null; joke: string | null }
type SavedJoke = Joke & { jokeApiId: number }
const categories = ['Any', 'Programming', 'Misc', 'Pun', 'Spooky', 'Christmas']

function getVisitorId() {
  const key = 'daily-punch-visitor'
  let id = localStorage.getItem(key)
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id) }
  return id
}

function PunchlineDesk() {
  const [jokes, setJokes] = useState<Joke[]>([])
  const [favorites, setFavorites] = useState<SavedJoke[]>([])
  const [category, setCategory] = useState('Any')
  const [type, setType] = useState('Any')
  const [tab, setTab] = useState<'feed' | 'saved'>('feed')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState<number | null>(null)

  const loadJokes = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch(`/api/jokes?category=${encodeURIComponent(category)}&type=${encodeURIComponent(type)}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      setJokes(data.jokes)
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Something went sideways.') }
    finally { setLoading(false) }
  }, [category, type])

  const loadFavorites = useCallback(async () => {
    try {
      const response = await fetch('/api/favorites', { headers: { 'x-visitor-id': getVisitorId() } })
      if (response.ok) setFavorites((await response.json()).favorites)
    } catch { /* The feed remains useful when saved jokes are temporarily unavailable. */ }
  }, [])

  useEffect(() => { void loadJokes() }, [loadJokes])
  useEffect(() => { void loadFavorites() }, [loadFavorites])

  async function save(joke: Joke) {
    setSaving(joke.id)
    try {
      const response = await fetch('/api/favorites', { method: 'POST', headers: { 'content-type': 'application/json', 'x-visitor-id': getVisitorId() }, body: JSON.stringify(joke) })
      if (!response.ok) throw new Error()
      await loadFavorites()
    } catch { setError('Couldn’t save that one. Please try again.') }
    finally { setSaving(null) }
  }

  async function remove(id: number) {
    await fetch(`/api/favorites?id=${id}`, { method: 'DELETE', headers: { 'x-visitor-id': getVisitorId() } })
    setFavorites((current) => current.filter((item) => item.jokeApiId !== id))
  }

  const shown: Joke[] = tab === 'feed' ? jokes : favorites.map((item) => ({ ...item, id: item.jokeApiId }))
  const savedIds = new Set(favorites.map((item) => item.jokeApiId))

  return (
    <main className="app-shell">
      <header className="masthead">
        <a className="brand" href="#top" aria-label="The Daily Punch home"><span>THE DAILY</span><strong>PUNCH</strong></a>
        <nav aria-label="Main navigation">
          <button className={tab === 'feed' ? 'active' : ''} onClick={() => setTab('feed')}>Fresh batch</button>
          <button className={tab === 'saved' ? 'active' : ''} onClick={() => setTab('saved')}>Saved <span className="count">{favorites.length}</span></button>
        </nav>
        <div className="edition">ISSUE № 041<br /><span>GOOD MOODS, DAILY</span></div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker"><span /> Curated comic relief</p>
          <h1>A better break,<br /><em>one joke at a time.</em></h1>
          <p className="dek">No doomscrolling. No think pieces. Just a fresh stack of safe-for-work jokes, ready whenever your day needs a plot twist.</p>
        </div>
        <div className="hero-mark" aria-hidden="true"><Laugh strokeWidth={1.3} /><span>HA</span></div>
      </section>

      <section className="desk" aria-label="Joke controls">
        <div className="desk-label"><Sparkles size={17} /> THE WRITERS’ DESK</div>
        <label>Pick a shelf<select value={category} onChange={(event) => { setCategory(event.target.value); setTab('feed') }}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Delivery<select value={type} onChange={(event) => { setType(event.target.value); setTab('feed') }}><option value="Any">Any style</option><option value="single">One-liners</option><option value="twopart">Setup & punchline</option></select></label>
        <button className="refresh" onClick={() => { setTab('feed'); void loadJokes() }} disabled={loading}><RefreshCw size={18} className={loading ? 'spin' : ''} /> Fresh batch</button>
      </section>

      <section className="feed">
        <div className="section-head">
          <div><p>{tab === 'feed' ? 'JUST IN' : 'YOUR ARCHIVE'}</p><h2>{tab === 'feed' ? 'Today’s punchlines' : 'Keepers, all in one place'}</h2></div>
          <span>{tab === 'feed' ? 'Updated on demand' : `${favorites.length} saved joke${favorites.length === 1 ? '' : 's'}`}</span>
        </div>

        {error && <div className="error" role="alert">{error}<button onClick={() => setError('')}>Dismiss</button></div>}
        {loading && tab === 'feed' ? <div className="joke-grid" aria-label="Loading jokes">{Array.from({ length: 4 }).map((_, index) => <div className="skeleton" key={index} />)}</div> :
          shown.length ? <div className="joke-grid">{shown.map((joke, index) => (
            <article className="joke-card" key={joke.id} style={{ '--delay': `${index * 70}ms` } as React.CSSProperties}>
              <div className="card-top"><span>{String(index + 1).padStart(2, '0')}</span><span className="tag">{joke.category}</span></div>
              <div className="joke-copy">{joke.type === 'twopart' ? <><p>{joke.setup}</p><strong>{joke.delivery}</strong></> : <strong>{joke.joke}</strong>}</div>
              <div className="card-foot"><span>{joke.type === 'single' ? 'ONE-LINER' : 'SETUP / PAYOFF'}</span>{tab === 'feed' ? <button disabled={savedIds.has(joke.id) || saving === joke.id} onClick={() => void save(joke)}>{savedIds.has(joke.id) ? <Check size={17} /> : <Bookmark size={17} />}{savedIds.has(joke.id) ? 'Saved' : 'Keep this'}</button> : <button onClick={() => void remove(joke.id)}><Trash2 size={17} /> Remove</button>}</div>
            </article>
          ))}</div> : <div className="empty"><Bookmark size={32} /><h3>Your best material goes here.</h3><p>Save a joke from the fresh batch and it’ll wait for you in this archive.</p><button onClick={() => setTab('feed')}>Browse jokes <ChevronRight size={17} /></button></div>}
      </section>

      <footer><div className="brand small"><span>THE DAILY</span><strong>PUNCH</strong></div><p>Jokes supplied by <a href="https://v2.jokeapi.dev/" target="_blank" rel="noreferrer">JokeAPI</a> · Safe mode always on.</p><p>Made for coffee breaks, awkward silences & Tuesdays.</p></footer>
    </main>
  )
}
