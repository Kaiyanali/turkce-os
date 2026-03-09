export function calculatePhase(createdAt: string): number {
  const start = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;

  if (weeks <= 6) return 1;
  if (weeks <= 13) return 2;
  return 3;
}

export function calculateWeek(createdAt: string): number {
  const start = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  return Math.min(22, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1);
}

export function daysUntilTarget(targetDate: string): number {
  const target = new Date(targetDate);
  const now = new Date();
  return Math.max(
    0,
    Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );
}

export function getPhaseInfo(phase: number) {
  const phases: Record<number, { name: string; weeks: string; focus: string }> =
    {
      1: {
        name: 'Foundation',
        weeks: '1–6',
        focus:
          'Alphabet, vowel harmony, greetings, basic vocab, present tense "to be"',
      },
      2: {
        name: 'Building',
        weeks: '7–13',
        focus:
          'Past tense, present continuous (-yor), case markers, daily conversations',
      },
      3: {
        name: 'Fluency',
        weeks: '14–22',
        focus:
          'Future tense, conditionals, modal suffixes, complex sentences, natural speech',
      },
    };
  return phases[phase] || phases[1];
}
