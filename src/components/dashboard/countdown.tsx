'use client';

import { daysUntilTarget } from '@/lib/phase';

interface CountdownProps {
  targetDate: string;
}

export function Countdown({ targetDate }: CountdownProps) {
  const days = daysUntilTarget(targetDate);

  return (
    <div className="rounded-xl bg-surface border border-white/5 p-4 text-center">
      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
        Days Until Target
      </p>
      <p className="text-4xl font-display font-bold text-amber">{days}</p>
      <p className="text-sm text-gray-400 mt-1">
        {days > 100
          ? 'Plenty of time — build strong habits now'
          : days > 50
          ? 'Halfway there — keep the momentum'
          : days > 20
          ? 'Final stretch — push through!'
          : 'Almost there — you can do this!'}
      </p>
    </div>
  );
}
