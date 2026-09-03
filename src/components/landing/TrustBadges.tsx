const BADGES = ['Hand-Drawn Pixel Art, Not Generated', '3–10 Day Turnaround', 'Delivered As Your Own Story Link'];

export function TrustBadges() {
  return (
    <section className="border-y border-white/10 bg-white/[0.02] px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-3">
        {BADGES.map((badge) => (
          <span key={badge} className="text-xs uppercase tracking-wide text-white/50">
            {badge}
          </span>
        ))}
      </div>
    </section>
  );
}
