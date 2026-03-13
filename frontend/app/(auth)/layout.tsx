import Link from 'next/link';
import { Sword } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 group">
                <div className="bg-brand-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-brand-500/20">
                <Sword className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">
                Argumint
                </span>
            </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
