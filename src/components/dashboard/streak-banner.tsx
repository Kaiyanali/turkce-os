'use client';

import { getStreakMilestone, getStreakEmoji, isStreakAtRisk } from '@/lib/streak';

interface StreakBannerProps {
  currentStreak: number;
  longestStreak: number;
  hasActivityToday: boolean;
  totalDaysStudied: number;
}

export function StreakBanner({
  currentStreak,
  longestStreak,
  hasActivityToday,
  totalDaysStudied,
}: StreakBannerProps) {
  const milestone = getStreakMilestone(currentStreak);
  const emoji = getStreakEmoji(currentStreak);
  const atRisk = !hasActivityToday && isStreakAtRisk();

  return (
    <div
      className={`rounded-xl p-4 border ${
        atRisk
          ? 'bg-red-500/10 border-red-500/30'
          : hasActivityToday
          ? 'bg-amber/10 border-amber/20'
          : 'bg-surface border-white/5'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji || '💤'}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-display text-white">
                {currentStreak}
              </span>
              <span className="text-sm text-gray-400">day streak</span>
            </div>
            {milestone && (
              <span className="text-xs text-amber">{milestone}</span>
            )}
            {atRisk && (
              <span className="text-xs text-red-400 font-medium">
                Streak at risk! Study now to keep it going.
              </span>
            )}
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>{totalDaysStudied} total days</div>
          <div>Best: {longestStreak}</div>
        </div>
      </div>
    </div>
  );
}
