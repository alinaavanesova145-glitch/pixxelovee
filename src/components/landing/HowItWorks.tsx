const STEPS = [
  { number: '01', title: 'Pick your world & who it’s for', caption: 'Choose a vibe and tell us who the story is for.' },
  { number: '02', title: 'We hand-draw your pixel story', caption: 'Real reference photos become real pixel art.' },
  { number: '03', title: 'Review your preview', caption: 'We send a link before anything ships.' },
  { number: '04', title: 'Get your private story link', caption: 'Share it — or keep it just for them.' },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="mb-10 text-center font-heading text-3xl font-bold text-white">how it works</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        {STEPS.map((step) => (
          <div key={step.number} className="rounded-2xl border border-white/10 p-5 text-center">
            <p className="mb-3 font-pixel text-lg text-neon">{step.number}</p>
            <p className="mb-2 font-heading text-sm font-semibold text-white">{step.title}</p>
            <p className="text-xs text-white/50">{step.caption}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
