import { Lightbulb, Sword, ShieldCheck, Sparkles, Crown, LucideIcon } from 'lucide-react';

export interface Tier {
    name: string;
    level: number;
    minPoints: number;
    nextPoints: number;
    color: string;
    bg: string;
    icon: LucideIcon;
    effect?: string;
}

export const TIERS: Tier[] = [
    {
        name: "Novice Thinker",
        level: 1,
        minPoints: 0,
        nextPoints: 100,
        color: "text-zinc-500",
        bg: "bg-zinc-200 dark:bg-zinc-700",
        icon: Lightbulb,
    },
    {
        name: "Logic Warrior",
        level: 2,
        minPoints: 100,
        nextPoints: 300,
        color: "text-white",
        bg: "bg-emerald-500 shadow-lg shadow-emerald-500/20",
        icon: Sword,
    },
    {
        name: "Debate Elite",
        level: 3,
        minPoints: 300,
        nextPoints: 600,
        color: "text-white",
        bg: "bg-blue-600 shadow-xl shadow-blue-500/20",
        icon: ShieldCheck,
    },
    {
        name: "Master Strategist",
        level: 4,
        minPoints: 600,
        nextPoints: 1000,
        color: "text-white",
        bg: "bg-gradient-to-br from-brand-600 to-brand-400 shadow-2xl shadow-brand-500/30",
        icon: Sparkles,
    },
    {
        name: "Arena Legend",
        level: 5,
        minPoints: 1000,
        nextPoints: 0,
        color: "text-white",
        bg: "bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-500 shadow-2xl shadow-amber-500/40",
        icon: Crown,
    }
];

export function getTier(points: number): Tier {
    return [...TIERS].reverse().find(t => points >= t.minPoints) || TIERS[0];
}
