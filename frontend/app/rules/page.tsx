'use client';
import { Card } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { Trophy, Star, TrendingUp, Shield, MessageCircle, Zap } from 'lucide-react';
import { TIERS } from '@/lib/tiers';
import TierIcon from '@/app/components/TierIcon';

/**
 * Renders the Rules page, outlining the scoring system and user evolution tiers within the Argumint Arena.
 * It explains how users earn reputation and progress through different ranks.
 */
export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-widest mb-6 border border-brand-100">
          Arena Handbook
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4 text-zinc-900 dark:text-white">
          Scoring & Evolution
        </h1>
        <p className="text-zinc-500 font-medium max-w-xl mx-auto">
          Master the art of discourse in the Argumint Arena. Learn how to build your reputation, climb the ranks, and become a logic legend.
        </p>
      </div>

      <div className="grid gap-20">
        {/* Reputation System: Explains how users gain and lose reputation points. */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-brand-600 rounded-xl shadow-lg shadow-brand-500/20">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight italic text-zinc-900 dark:text-white">Reputation Metrics</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <ScoreCard 
              icon={<TrendingUp className="text-emerald-500" />}
              title="Upvote Received"
              points="+5 Points"
              description="Earned when your argument resonates with the community and demonstrates sharp logic."
            />
            <ScoreCard 
              icon={<TrendingDown className="text-rose-500" />}
              title="Downvote Received"
              points="-2 Points"
              description="Deducted if your argument lacks evidence or violates the arena's code of conduct."
            />
            <ScoreCard 
              icon={<MessageCircle className="text-brand-500" />}
              title="Strategic Rebuttal"
              points="High Impact"
              description="Dismantling a top-tier argument grants massive visibility and influence."
            />
            <ScoreCard 
              icon={<Trophy className="text-amber-500" />}
              title="Arena Victory"
              points="+10 Points"
              description="Awarded to every participant of the winning side once the 24h cycle concludes."
            />
          </div>
        </section>

        {/* Evolution Tiers */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-zinc-900 dark:bg-zinc-800 rounded-xl shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight italic text-zinc-900 dark:text-white">Evolution Tiers</h2>
          </div>

          <div className="space-y-4">
            {TIERS.map((tier) => (
              <div 
                key={tier.level}
                className="flex items-center justify-between p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-brand-200 transition-all group"
              >
                <div className="flex items-center gap-6">
                  <TierIcon tier={tier} size="md" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tier {tier.level}</span>
                      <div className="h-1 w-1 rounded-full bg-zinc-300"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-600">{tier.minPoints}+ PTS</span>
                    </div>
                    <h3 className="font-black uppercase tracking-tight text-xl text-zinc-900 dark:text-white">{tier.name}</h3>
                  </div>
                </div>
                <Badge variant="neutral" className="opacity-0 group-hover:opacity-100 transition-opacity">Unlocked at {tier.minPoints} pts</Badge>
              </div>
            ))}
          </div>
        </section>

        {/* Pro Tip Card */}
        <Card className="p-10 bg-brand-600 text-white border-none shadow-2xl shadow-brand-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Trophy className="w-48 h-48 rotate-12" />
            </div>
            <div className="relative z-10">
                <h3 className="text-2xl font-black uppercase italic mb-4">Pro Tip: Momentum is Key</h3>
                <p className="text-brand-100 leading-relaxed font-medium mb-6">
                    The feed is sorted by a "Hot" algorithm. It favors arguments that receive rapid engagement early on. To stay at the top, craft compelling headlines and engage with rebuttals quickly.
                </p>
                <div className="flex gap-4">
                    <div className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest">Speed +5</div>
                    <div className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest">Logic +10</div>
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
}

function ScoreCard({ icon, title, points, description }: any) {
  return (
    <Card hover className="p-6 border-zinc-100 dark:border-zinc-800 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">{icon}</div>
        <h3 className="font-black uppercase tracking-tight text-xs text-zinc-400">{title}</h3>
      </div>
      <div className="text-3xl font-black text-zinc-900 dark:text-white mb-2">{points}</div>
      <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">{description}</p>
    </Card>
  );
}

function TrendingDown(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 9 8.5 14 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
  );
}
