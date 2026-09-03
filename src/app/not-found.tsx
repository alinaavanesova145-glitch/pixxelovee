import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
      <p className="font-heading text-xl font-semibold text-[#FFB6C1]">this page doesn&apos;t exist</p>
      <p className="max-w-sm text-sm text-white/50">Maybe the link is old, or maybe it was never here to begin with.</p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-neon px-6 py-3 font-heading text-sm font-semibold text-white shadow-[0_0_20px_rgba(255,62,165,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(255,62,165,0.65)]"
      >
        back home
      </Link>
    </main>
  );
}
