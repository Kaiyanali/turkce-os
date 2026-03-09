'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { MobileNav } from '@/components/navigation/mobile-nav';
import { Sidebar } from '@/components/navigation/sidebar';
import { Loading } from '@/components/ui/loading';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setEmail(user.email || '');

      // Seed vocabulary for new users
      try {
        const { count } = await supabase
          .from('vocabulary')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (count === 0) {
          await fetch('/api/seed', { method: 'POST' });
        }
      } catch {
        // Ignore seed errors
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return <Loading fullPage />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar email={email} />
      <main className="flex-1 pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6 lg:px-8">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
