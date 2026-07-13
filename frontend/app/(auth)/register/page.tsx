'use client';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState<string | null>(null);
  
  const mutation = useMutation({
    mutationFn: async (data: any) => {
        return api.post('/auth/register', data);
    },
    onSuccess: (response) => {
        // Registration returns a session token — go straight to the arena.
        const token = response.data?.access_token;
        if (token) {
            localStorage.setItem('token', token);
            router.push('/dashboard');
        } else {
            router.push('/login');
        }
    },
    onError: (err: any) => {
        setError(err.response?.data?.detail || 'Registration failed');
    }
  });

  const onSubmit = (data: any) => {
    setError(null);
    mutation.mutate(data);
  };

  return (
    <Card className="p-8 shadow-premium border-brand-100">
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase mb-2">
            Join Arena
        </h2>
        <p className="text-sm font-medium text-zinc-500">
            Create your alias and start your journey.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold uppercase tracking-wider">
            {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">Username (Alias)</label>
            <input
                {...register('username')}
                type="text"
                placeholder="shadow_blade"
                required
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
            />
        </div>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">Email Address</label>
            <input
                {...register('email')}
                type="email"
                placeholder="warrior@arena.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
            />
        </div>
        <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">Password</label>
            <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
            />
        </div>
        
        <Button
            type="submit"
            className="w-full h-12 mt-4"
            isLoading={mutation.isPending}
        >
            Create Alias
        </Button>
      </form>

      <p className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-zinc-400">
        Already have an alias?{' '}
        <Link href="/login" className="text-brand-600 hover:text-brand-700 underline underline-offset-4">
            Sign In
        </Link>
      </p>
    </Card>
  );
}
