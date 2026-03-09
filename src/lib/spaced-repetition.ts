import { SM2Rating } from '@/types';

interface SM2Result {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review: string;
}

export function calculateSM2(
  rating: SM2Rating,
  currentEaseFactor: number,
  currentInterval: number,
  currentRepetitions: number
): SM2Result {
  let easeFactor = currentEaseFactor;
  let interval: number;
  let repetitions: number;

  if (rating < 3) {
    interval = 1;
    repetitions = 0;
  } else {
    if (currentRepetitions === 0) {
      interval = 1;
    } else if (currentRepetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(currentInterval * easeFactor);
    }
    easeFactor =
      easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
    easeFactor = Math.max(1.3, easeFactor);
    repetitions = currentRepetitions + 1;
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    ease_factor: easeFactor,
    interval_days: interval,
    repetitions,
    next_review: nextReview.toISOString().split('T')[0],
  };
}
