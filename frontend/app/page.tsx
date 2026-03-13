import Link from 'next/link';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { Sword, Zap, BarChart3, Users, MessageSquare } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-widest mb-8 border border-brand-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            Arena is Live
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-zinc-900 dark:text-white">
            FORGE YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">ARGUMENTS.</span> <br />
            CONQUER THE ARENA.
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-zinc-500 dark:text-zinc-400 mb-12 font-medium leading-relaxed">
            Join the daily battle of ideas. Choose your side, craft powerful rebuttals, and rise to the top of the leaderboard with logic and community support.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="h-16 px-10 rounded-2xl text-lg">
                Enter the Arena
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl text-lg bg-white/50 backdrop-blur-sm">
                View Rankings
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-300/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-brand-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                <div>
                    <div className="text-4xl font-black mb-1 italic">24H</div>
                    <div className="text-brand-100 text-xs font-bold uppercase tracking-widest">New Topics</div>
                </div>
                <div>
                    <div className="text-4xl font-black mb-1 italic">10K+</div>
                    <div className="text-brand-100 text-xs font-bold uppercase tracking-widest">Active Debaters</div>
                </div>
                <div>
                    <div className="text-4xl font-black mb-1 italic">50K+</div>
                    <div className="text-brand-100 text-xs font-bold uppercase tracking-widest">Daily Posts</div>
                </div>
                <div>
                    <div className="text-4xl font-black mb-1 italic">100%</div>
                    <div className="text-brand-100 text-xs font-bold uppercase tracking-widest">Pure Logic</div>
                </div>
            </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
                <h2 className="text-4xl font-black tracking-tighter uppercase mb-4">Weaponize Your Intellect</h2>
                <div className="h-1.5 w-24 bg-brand-600 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={<Zap className="w-8 h-8 text-brand-600" />}
                    title="Real-time Combat"
                    description="Experience high-velocity discourse. Arguments, rebuttals, and votes update instantly as the battle unfolds."
                />
                <FeatureCard 
                    icon={<BarChart3 className="w-8 h-8 text-brand-600" />}
                    title="Visual Analytics"
                    description="Visualize the momentum of ideas. See which side is winning through beautiful, data-driven sentiment graphs."
                />
                <FeatureCard 
                    icon={<Users className="w-8 h-8 text-brand-600" />}
                    title="Community Merit"
                    description="Your score reflects your impact. Earn points through likes, quality rebuttals, and picking the winning side."
                />
            </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <Card className="bg-brand-900 border-none p-12 text-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                      <Sword className="w-64 h-64 text-white rotate-45" />
                  </div>
                  <div className="relative z-10">
                    <h2 className="text-4xl font-black text-white mb-6 tracking-tighter">READY TO ENTER THE FRAY?</h2>
                    <p className="text-brand-100 text-lg mb-10 max-w-xl mx-auto">
                        Don't just watch the discourse—shape it. Join thousands of thinkers in the world's most dynamic debate arena.
                    </p>
                    <Link href="/register">
                        <Button variant="secondary" size="lg" className="h-16 px-12 rounded-2xl text-lg hover:bg-white transition-colors">
                            Claim Your Alias
                        </Button>
                    </Link>
                  </div>
              </Card>
          </div>
      </section>
      
      <footer className="py-12 border-t border-brand-100 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="bg-brand-600 p-1 rounded-lg">
                    <Sword className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-black tracking-tighter text-zinc-900 dark:text-white uppercase">
                    Argumint
                </span>
              </div>
              <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                  &copy; 2026 ARGUMINT ARENA. Built for the bold.
              </div>
              <div className="flex gap-6">
                  <a href="#" className="text-zinc-400 hover:text-brand-600 transition-colors uppercase text-[10px] font-bold tracking-widest">Privacy</a>
                  <a href="#" className="text-zinc-400 hover:text-brand-600 transition-colors uppercase text-[10px] font-bold tracking-widest">Terms</a>
                  <a href="#" className="text-zinc-400 hover:text-brand-600 transition-colors uppercase text-[10px] font-bold tracking-widest">Discord</a>
              </div>
          </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <Card hover className="flex flex-col items-start text-left h-full">
            <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-tighter text-zinc-900 dark:text-white">{title}</h3>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                {description}
            </p>
        </Card>
    );
}
