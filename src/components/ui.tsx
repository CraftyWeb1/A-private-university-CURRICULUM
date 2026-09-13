export function pct(done: number, total: number) {
  if (!total) return 0
  return Math.round((done / total) * 100)
}

export function Star() {
  return <i className="star" aria-hidden="true" />
}

export function Rule({ children }: { children: string }) {
  return (
    <div className="rule">
      <Star />
      {children}
      <Star />
    </div>
  )
}

export function Ring({ value, label }: { value: number; label: string }) {
  const r = 28
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" aria-label={label}>
      <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(28,23,18,0.1)" strokeWidth="6" />
      <circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke="#355744"
        strokeWidth="6"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
      />
      <text x="40" y="44" textAnchor="middle" fontSize="14" fontFamily="Cormorant Garamond, serif" fill="#1c1712">
        {value}%
      </text>
    </svg>
  )
}

export function Progress({ done, total }: { done: number; total: number }) {
  return (
    <div className="progress-line" aria-hidden="true">
      <span style={{ width: `${pct(done, total)}%` }} />
    </div>
  )
}

export function NewId() {
  return crypto.randomUUID()
}
