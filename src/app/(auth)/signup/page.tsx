'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="bg-surface rounded-2xl border border-white/5 p-8 text-center">
        <span className="text-4xl mb-4 block">✅</span>
        <h2 className="font-display text-xl font-bold text-white mb-2">
          Check your email
        </h2>
        <p className="text-gray-400 text-sm">
          We sent a confirmation link to{' '}
          <strong className="text-white">{email}</strong>
        </p>
        <Link
          href="/login"
          className="inline-block mt-4 text-sm text-amber hover:underline"
        >
          Back to login
        </Link>
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
          Start your Turkish journey
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Your name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
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
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-amber hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
