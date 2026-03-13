'use client';
import { useForm } from 'react-hook-form';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { MessageSquare, Send, X } from 'lucide-react';
import { useEffect } from 'react';

interface ArgumentComposerProps {
    parentId?: number | null;
    onSubmit: (data: { title?: string; content: string; parent_post_id?: number | null; type: 'argument' | 'rebuttal' }) => void;
    onCancel?: () => void;
    isSubmitting?: boolean;
    autoFocus?: boolean;
}

export default function ArgumentComposer({ parentId, onSubmit, onCancel, isSubmitting, autoFocus }: ArgumentComposerProps) {
    const { register, handleSubmit, reset, setFocus } = useForm();
    const isReply = !!parentId;

    useEffect(() => {
        if (autoFocus) {
            setFocus('content');
        }
    }, [autoFocus, setFocus]);

    const handleFormSubmit = (data: any) => {
        onSubmit({
            ...data,
            parent_post_id: parentId || null,
            type: isReply ? 'rebuttal' : 'argument'
        });
        reset();
    };

    return (
        <Card className={`bg-zinc-50 dark:bg-zinc-900/50 border-dashed border-2 border-zinc-200 dark:border-zinc-800 shadow-none ${isReply ? 'p-4' : 'p-6 mb-12'}`}>
            <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-brand-600 rounded-lg">
                    <MessageSquare className="w-3.5 h-3.5 text-white" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
                    {isReply ? 'Forge a Rebuttal' : 'Strike with an Argument'}
                </h4>
            </div>
            
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                {!isReply && (
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">Headline (Optional)</label>
                        <input 
                            {...register('title')}
                            placeholder="A powerful opening statement..."
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                        />
                    </div>
                )}
                
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">Your Reasoning</label>
                    <textarea 
                        {...register('content', { required: true })}
                        placeholder={isReply ? "Dismantle their logic..." : "Lay out your evidence..."}
                        className="w-full px-4 py-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium min-h-[120px] resize-none"
                    />
                </div>
                
                <div className="flex gap-2 justify-end">
                    {onCancel && (
                        <Button 
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onCancel}
                            className="rounded-xl h-10 px-4 gap-2"
                        >
                            <X className="w-4 h-4" />
                            Discard
                        </Button>
                    )}
                    <Button 
                        disabled={isSubmitting}
                        type="submit"
                        size="sm"
                        className="rounded-xl h-10 px-6 gap-2"
                        isLoading={isSubmitting}
                    >
                        <Send className="w-3.5 h-3.5" />
                        {isReply ? 'Strike Back' : 'Deploy'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
