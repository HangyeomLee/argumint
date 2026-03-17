'use client';
import { useForm } from 'react-hook-form';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { MessageSquare, Send, X } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Props for the ArgumentComposer component.
 */
interface ArgumentComposerProps {
    /** The ID of the parent post if this is a rebuttal, otherwise null or undefined. */
    parentId?: number | null;
    /** Callback function to be called when the form is submitted. */
    onSubmit: (data: { title?: string; content: string; parent_post_id?: number | null; type: 'argument' | 'rebuttal' }) => void;
    /** Optional callback function to be called when the composition is cancelled. */
    onCancel?: () => void;
    /** Indicates if the form is currently submitting, used to disable buttons and show loading states. */
    isSubmitting?: boolean;
    /** If true, the content input field will be automatically focused on mount. */
    autoFocus?: boolean;
}

/**
 * A component that allows users to compose new arguments or rebuttals within a debate.
 * It provides input fields for title (for arguments) and content, along with submit and cancel buttons.
 */
export default function ArgumentComposer({ parentId, onSubmit, onCancel, isSubmitting, autoFocus }: ArgumentComposerProps) {
    const { register, handleSubmit, reset, setFocus } = useForm();
    // Determine if the composer is for a rebuttal (i.e., replying to an existing post).
    const isReply = !!parentId;

    // Effect to set focus on the content input field if autoFocus is true.
    useEffect(() => {
        if (autoFocus) {
            setFocus('content');
        }
    }, [autoFocus, setFocus]);

    /**
     * Handles the form submission. It prepares the data with parentId and type,
     * calls the onSubmit prop, and then resets the form.
     * @param {any} data - The form data containing title and content.
     */
    const handleFormSubmit = (data: any) => {
        onSubmit({
            ...data,
            parent_post_id: parentId || null, // Assign parent ID if it's a rebuttal
            type: isReply ? 'rebuttal' : 'argument' // Set post type based on whether it's a reply
        });
        reset(); // Clear the form fields after submission
    };

    return (
        <Card className={`bg-zinc-50 dark:bg-zinc-900/50 border-dashed border-2 border-zinc-200 dark:border-zinc-800 shadow-none ${isReply ? 'p-4' : 'p-6 mb-12'}`}>
            <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-brand-600 rounded-lg">
                    <MessageSquare className="w-3.5 h-3.5 text-white" />
                </div>
                {/* Dynamically change the header text based on whether it's a reply or a new argument */}
                <h4 className="text-sm font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
                    {isReply ? 'Forge a Rebuttal' : 'Strike with an Argument'}
                </h4>
            </div>
            
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                {/* Title input for new arguments (not rebuttals) */}
                {!isReply && (
                    <div>
                        <label htmlFor="title" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">Headline (Optional)</label>
                        <input 
                            id="title"
                            {...register('title')}
                            placeholder="A powerful opening statement..."
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                        />
                    </div>
                )}
                
                {/* Content textarea for both arguments and rebuttals */}
                <div>
                    <label htmlFor="content" className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">Your Reasoning</label>
                    <textarea 
                        id="content"
                        {...register('content', { required: true })}
                        placeholder={isReply ? "Dismantle their logic..." : "Lay out your evidence..."}
                        className="w-full px-4 py-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium min-h-[120px] resize-none"
                    />
                </div>
                
                <div className="flex gap-2 justify-end">
                    {/* Discard/Cancel button, only shown if onCancel prop is provided */}
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
                    {/* Submit button, with dynamic text and loading state */}
                    <Button 
                        disabled={isSubmitting} // Disable during submission
                        type="submit"
                        size="sm"
                        className="rounded-xl h-10 px-6 gap-2"
                        isLoading={isSubmitting} // Show loading spinner if submitting
                    >
                        <Send className="w-3.5 h-3.5" />
                        {isReply ? 'Strike Back' : 'Deploy'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
