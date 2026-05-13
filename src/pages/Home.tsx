export default function Home() {
  const now = new Date()
  const formattedDate = now.toLocaleDateString('en-NG', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <section className="section stack gap-16">
      <header className="row-between">
        <div>
          <p className="text-sm text-muted">Welcome back</p>
          <h1>TailorDeck</h1>
        </div>
        <div className="center h-11 w-11 rounded-full bg-primary text-sm font-bold" style={{ color: '#FAF0E8' }}>
          TD
        </div>
      </header>

      <div className="card">
        <p className="text-sm text-muted">{formattedDate}</p>
        <p className="mt-8 text-base">Dashboard metrics and recent jobs will be loaded here next.</p>
      </div>
    </section>
  )
}
