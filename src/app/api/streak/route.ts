import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!streak) {
      // Create new streak
      await supabase.from('streaks').insert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: today,
        total_days_studied: 1,
      });
      return NextResponse.json({ streak: 1 });
    }

    // Already logged today
    if (streak.last_activity_date === today) {
      return NextResponse.json({ streak: streak.current_streak });
    }

    const lastDate = streak.last_activity_date
      ? new Date(streak.last_activity_date)
      : null;
    const todayDate = new Date(today);

    let newStreak = 1;
    if (lastDate) {
      const diffDays = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        newStreak = streak.current_streak + 1;
      }
    }

    const newLongest = Math.max(streak.longest_streak, newStreak);

    await supabase
      .from('streaks')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: today,
        total_days_studied: streak.total_days_studied + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    return NextResponse.json({ streak: newStreak });
  } catch (error) {
    console.error('Streak error:', error);
    return NextResponse.json(
      { error: 'Failed to update streak' },
      { status: 500 }
    );
  }
}
