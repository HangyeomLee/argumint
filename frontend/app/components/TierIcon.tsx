'use client';
import { motion } from 'framer-motion';
import { Tier } from '@/lib/tiers';
import { Sparkles } from 'lucide-react';

interface TierIconProps {
    tier: Tier;
    size?: 'sm' | 'md' | 'lg';
}

export default function TierIcon({ tier, size = 'md' }: TierIconProps) {
    const Icon = tier.icon;
    
    const sizes = {
        sm: 'w-10 h-10 rounded-xl p-2',
        md: 'w-14 h-14 rounded-2xl p-3',
        lg: 'w-24 h-24 rounded-[2rem] p-5',
    };

    const iconSizes = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-14 h-14',
    };

    return (
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`relative group`}
        >
            {/* 상위 티어용 배경 아우라 (Glow) */}
            {tier.level >= 4 && (
                <motion.div 
                    animate={{ 
                        scale: [1, 1.3, 1],
                        rotate: [0, 180, 360],
                        opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className={`absolute inset-[-15px] blur-2xl rounded-full ${tier.level === 5 ? 'bg-amber-400' : 'bg-brand-400'} -z-10`}
                />
            )}

            {/* 레전드 전용 외부 파티클 */}
            {tier.level === 5 && (
                <div className="absolute inset-0 z-20 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{ 
                                y: [0, -60], 
                                x: [0, (i % 2 === 0 ? 30 : -30) * Math.random()],
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0],
                                rotate: [0, 360]
                            }}
                            transition={{ 
                                duration: 2.5, 
                                repeat: Infinity, 
                                delay: i * 0.3,
                                ease: "easeOut"
                            }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        >
                            <Sparkles className="w-3 h-3 text-yellow-200 fill-yellow-200 shadow-[0_0_10px_white]" />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* 메인 박스 */}
            <motion.div 
                animate={
                    tier.level === 5 ? { y: [0, -12, 0] } : 
                    tier.level === 4 ? { y: [0, -8, 0] } : 
                    {}
                }
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className={`${sizes[size]} ${tier.bg} ${tier.color} flex items-center justify-center relative shadow-2xl overflow-hidden border border-white/30`}
            >
                {/* 1. 기본 화이트 광택 (Lvl 3 전용) */}
                {tier.level === 3 && (
                    <motion.div 
                        animate={{ x: [-200, 300] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.5 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-[45deg] pointer-events-none"
                    />
                )}

                {/* 2. 마스터 전용 오로라(Iridescent) 광택 (Lvl 4 전용) */}
                {tier.level === 4 && (
                    <motion.div 
                        animate={{ 
                            x: [-300, 400],
                            opacity: [0.3, 0.7, 0.3]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-blue-400 via-fuchsia-300 via-indigo-400 to-transparent -skew-x-[30deg] pointer-events-none blur-sm"
                    />
                )}

                {/* 3. 레전드 전용 골든 글로우 (Lvl 5 전용) */}
                {tier.level === 5 && (
                    <motion.div 
                        animate={{ 
                            x: [-300, 400],
                            opacity: [0.5, 0.9, 0.5]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-yellow-200 via-white via-orange-200 to-transparent -skew-x-[45deg] pointer-events-none"
                    />
                )}

                {/* 내부 반짝임 입자 (Lvl 4, 5) */}
                {tier.level >= 4 && (
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={`inner-${i}`}
                                animate={{ 
                                    opacity: [0, 0.8, 0],
                                    scale: [0.5, 1.2, 0.5]
                                }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                                className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]"
                                style={{ 
                                    top: `${Math.random() * 100}%`, 
                                    left: `${Math.random() * 100}%` 
                                }}
                            />
                        ))}
                    </div>
                )}

                <Icon className={`${iconSizes[size]} relative z-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)]`} strokeWidth={3} />
            </motion.div>
        </motion.div>
    );
}
