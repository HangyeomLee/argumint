'use client';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState<string | null>(null);
  
  const mutation = useMutation({
    mutationFn: async (data: any) => {
        const formData = new FormData();
        formData.append('username', data.email);
        formData.append('password', data.password);
        return api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    onSuccess: (response) => {
        localStorage.setItem('token', response.data.access_token);
        router.push('/dashboard');
    },
    onError: (err: any) => {
        setError(err.response?.data?.detail || 'Invalid credentials');
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
            Welcome Back
        </h2>
        <p className="text-sm font-medium text-zinc-500">
            Sign in to rejoin the debate arena.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold uppercase tracking-wider">
            {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
            Enter Arena
        </Button>
      </form>

      <p className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-zinc-400">
        New here?{' '}
        <Link href="/register" className="text-brand-600 hover:text-brand-700 underline underline-offset-4">
            Claim Your Alias
        </Link>
      </p>
    </Card>
  );
}
