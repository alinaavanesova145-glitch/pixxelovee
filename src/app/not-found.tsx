import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center">
      <p className="font-pixel text-sm text-[#FFB6C1]">this page doesn&apos;t exist</p>
      <p className="max-w-sm text-sm text-white/50">Maybe the link is old, or maybe it was never here to begin with.</p>
      <Link
        href="/"
        className="mt-2 rounded-full border border-[#FFB6C1]/40 px-5 py-2 font-pixel text-[10px] text-white transition-colors hover:bg-[#FFB6C1]/10"
      >
        back home
      </Link>
    </main>
  );
}
