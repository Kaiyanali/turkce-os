'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/conversation', label: 'Conversation', icon: '💬' },
  { href: '/vocabulary', label: 'Vocabulary', icon: '📚' },
  { href: '/grammar', label: 'Grammar', icon: '📝' },
  { href: '/progress', label: 'Progress', icon: '📊' },
  { href: '/session', label: 'Log Session', icon: '⏱️' },
  { href: '/weekly-brief', label: 'Weekly Brief', icon: '📋' },
];

interface SidebarProps {
  email?: string;
}

export function Sidebar({ email }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-surface border-r border-white/5 h-screen sticky top-0">
      <div className="p-6 border-b border-white/5">
        <h1 className="font-display text-2xl font-bold text-amber">
          Türkçe OS
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Your Turkish Learning Journey
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-amber/10 text-amber font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-surface-light'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <p className="text-xs text-gray-500 truncate mb-2">{email}</p>
        <button
          onClick={handleSignOut}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
