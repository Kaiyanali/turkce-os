'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Enter your email first');
      return;
    }
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="bg-surface rounded-2xl border border-white/5 p-8 text-center">
        <span className="text-4xl mb-4 block">📧</span>
        <h2 className="font-display text-xl font-bold text-white mb-2">
          Check your email
        </h2>
        <p className="text-gray-400 text-sm">
          We sent a magic link to <strong className="text-white">{email}</strong>
        </p>
        <button
          onClick={() => setMagicLinkSent(false)}
          className="mt-4 text-sm text-amber hover:underline"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-white/5 p-8">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-amber">
          Türkçe OS
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Your Turkish Learning Journey
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Sign In
        </Button>
      </form>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-xs text-gray-500">or</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      <Button
        variant="ghost"
        onClick={handleMagicLink}
        loading={loading}
        className="w-full mt-4"
      >
        Sign in with magic link
      </Button>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-amber hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
