interface Testimonial {
  name: string;
  quote: string;
}

/** Empty until real reviews exist — shape matches what a future review would need (name/handle, quote). */
const TESTIMONIALS: Testimonial[] = [];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="mb-2 text-center font-heading text-3xl font-bold text-white">save file entries</h2>
      <p className="mb-10 text-center text-sm text-white/50">What people are saying — once they&apos;ve said it.</p>

      {TESTIMONIALS.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
          <p className="text-sm text-white/40">Real reviews from real save files, coming soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-2xl border border-white/10 p-5">
              <p className="text-sm text-white/80">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-3 text-xs text-white/40">— {t.name}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
