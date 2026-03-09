'use client';

import { getPhaseInfo } from '@/lib/phase';

interface PhaseBadgeProps {
  phase: number;
  weekNumber: number;
}

const phaseColors: Record<number, string> = {
  1: 'border-amber/30 bg-amber/10',
  2: 'border-teal/30 bg-teal/10',
  3: 'border-purple-500/30 bg-purple-500/10',
};

export function PhaseBadge({ phase, weekNumber }: PhaseBadgeProps) {
  const info = getPhaseInfo(phase);

  return (
    <div
      className={`rounded-xl border p-4 ${phaseColors[phase] || phaseColors[1]}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs uppercase tracking-wider text-gray-400">
          Phase {phase}
        </span>
        <span className="text-xs text-gray-500">
          Week {weekNumber} of 22
        </span>
      </div>
      <h3 className="font-display text-lg text-white font-semibold">
        {info.name}
      </h3>
      <p className="text-sm text-gray-400 mt-1">{info.focus}</p>
    </div>
  );
}
