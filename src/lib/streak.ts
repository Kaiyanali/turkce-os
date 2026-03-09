export function calculateXP(stats: {
  vocabReviewed: number;
  conversationsCompleted: number;
  sessionsLogged: number;
}): number {
  return (
    stats.vocabReviewed * 10 +
    stats.conversationsCompleted * 25 +
    stats.sessionsLogged * 15
  );
}

export function getLevel(xp: number): {
  title: string;
  titleTr: string;
  minXP: number;
  nextXP: number;
} {
  if (xp >= 2000)
    return {
      title: 'Speaker',
      titleTr: 'Konuşmacı',
      minXP: 2000,
      nextXP: Infinity,
    };
  if (xp >= 500)
    return {
      title: 'Student',
      titleTr: 'Öğrenci',
      minXP: 500,
      nextXP: 2000,
    };
  return {
    title: 'Beginner',
    titleTr: 'Yeni Başlayan',
    minXP: 0,
    nextXP: 500,
  };
}

export function getStreakMilestone(streak: number): string | null {
  if (streak >= 66) return 'Habit Formed';
  if (streak >= 30) return 'One Month';
  if (streak >= 7) return 'One Week';
  return null;
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 66) return '🏆';
  if (streak >= 30) return '⚡';
  if (streak >= 7) return '🔥';
  if (streak >= 1) return '🔥';
  return '';
}

export function isStreakAtRisk(): boolean {
  const now = new Date();
  return now.getHours() >= 20;
}
