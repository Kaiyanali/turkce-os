'use client';

import Link from 'next/link';

const actions = [
  {
    href: '/conversation',
    label: 'Conversation',
    labelTr: 'Konuşma',
    icon: '💬',
    color: 'hover:border-amber/40',
  },
  {
    href: '/vocabulary',
    label: 'Vocabulary',
    labelTr: 'Kelimeler',
    icon: '📚',
    color: 'hover:border-teal/40',
  },
  {
    href: '/session',
    label: 'Log Session',
    labelTr: 'Oturum',
    icon: '⏱️',
    color: 'hover:border-green-500/40',
  },
  {
    href: '/grammar',
    label: 'Grammar',
    labelTr: 'Dilbilgisi',
    icon: '📝',
    color: 'hover:border-purple-500/40',
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={`flex flex-col items-center gap-2 p-4 bg-surface rounded-xl border border-white/5 transition-colors ${action.color}`}
        >
          <span className="text-2xl">{action.icon}</span>
          <span className="text-sm font-medium text-white">
            {action.label}
          </span>
          <span className="text-xs text-gray-500">{action.labelTr}</span>
        </Link>
      ))}
    </div>
  );
}
