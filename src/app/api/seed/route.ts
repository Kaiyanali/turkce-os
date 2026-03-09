import { createServerSupabaseClient } from '@/lib/supabase-server';
import { SEED_VOCABULARY } from '@/lib/seed-vocabulary';
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

    // Check if already seeded
    const { count } = await supabase
      .from('vocabulary')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (count && count > 0) {
      return NextResponse.json({ seeded: false, message: 'Already seeded' });
    }

    const today = new Date().toISOString().split('T')[0];
    const rows = SEED_VOCABULARY.map((word) => ({
      user_id: user.id,
      turkish: word.turkish,
      english: word.english,
      category: word.category,
      next_review: today,
    }));

    await supabase.from('vocabulary').insert(rows);

    return NextResponse.json({ seeded: true, count: rows.length });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed vocabulary' },
      { status: 500 }
    );
  }
}
