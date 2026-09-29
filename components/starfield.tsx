const STARS = [
  { top: '8%', left: '12%', size: 2, delay: '0s' },
  { top: '15%', left: '78%', size: 3, delay: '0.6s' },
  { top: '22%', left: '35%', size: 1, delay: '1.2s' },
  { top: '30%', left: '88%', size: 2, delay: '0.3s' },
  { top: '18%', left: '55%', size: 1, delay: '1.8s' },
  { top: '42%', left: '9%', size: 2, delay: '0.9s' },
  { top: '48%', left: '68%', size: 1, delay: '2.1s' },
  { top: '55%', left: '25%', size: 3, delay: '0.4s' },
  { top: '62%', left: '92%', size: 2, delay: '1.5s' },
  { top: '70%', left: '48%', size: 1, delay: '0.7s' },
  { top: '78%', left: '15%', size: 2, delay: '1.1s' },
  { top: '85%', left: '72%', size: 1, delay: '2.4s' },
  { top: '12%', left: '42%', size: 1, delay: '1.9s' },
  { top: '38%', left: '82%', size: 2, delay: '0.2s' },
  { top: '66%', left: '58%', size: 1, delay: '1.4s' },
  { top: '90%', left: '38%', size: 2, delay: '0.8s' },
  { top: '5%', left: '62%', size: 1, delay: '2.2s' },
  { top: '52%', left: '5%', size: 1, delay: '1.6s' },
  { top: '28%', left: '18%', size: 2, delay: '0.5s' },
  { top: '74%', left: '85%', size: 1, delay: '1.3s' },
]

export function Starfield({ className }: { className?: string }) {
  return (
    <div className={className} style={{ opacity: 'var(--q-starfield-opacity, 0.4)' }} aria-hidden="true">
      {STARS.map((star, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            background: 'var(--q-cyan)',
            boxShadow: '0 0 6px var(--q-cyan)',
            animation: `q-twinkle ${3 + (i % 4)}s ease-in-out ${star.delay} infinite`,
          }}
        />
      ))}
    </div>
  )
}
