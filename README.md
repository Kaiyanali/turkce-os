# Türkçe OS

Personal Turkish language learning platform. Built to take you from beginner to conversational (A2) by August 7th.

## Features

- **AI Conversation Practice** — Real-time Turkish conversation with Claude, corrections after every message
- **Spaced Repetition Vocabulary** — SM-2 algorithm flashcards with 50 starter words
- **Grammar Reference** — Phase-gated grammar topics with AI-generated explanations
- **Progress Dashboard** — Streak tracking, XP system, heatmap, vocabulary growth
- **Weekly AI Briefs** — Personalized study plans from Claude
- **Session Logging** — Track external study (YouTube, podcasts, textbooks)
- **PWA** — Installable on mobile, works offline-capable

## Tech Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth + PostgreSQL + RLS)
- Anthropic Claude API (claude-sonnet-4-6)
- Vercel deployment

## Deployment

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase-schema.sql`
3. Go to Settings → API and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
4. Go to Authentication → URL Configuration:
   - Add `https://learnturkish.co.uk` to Redirect URLs
   - Add `https://learnturkish.co.uk/callback` to Redirect URLs

### 2. Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_APP_URL=https://learnturkish.co.uk
```

### 3. Vercel Deployment

1. Push to GitHub: `git init && git add . && git commit -m "Initial commit"`
2. Connect repo to [Vercel](https://vercel.com)
3. Add all env vars in Vercel project settings
4. Add custom domain: `learnturkish.co.uk`
5. Deploy

### 4. Domain DNS

Point `learnturkish.co.uk` to Vercel:
- Add CNAME record: `cname.vercel-dns.com`
- Or A record: `76.76.21.21`

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Phase System

| Phase | Weeks | Focus |
|-------|-------|-------|
| 1 — Foundation | 1–6 | Alphabet, vowel harmony, greetings, basic vocab, present tense |
| 2 — Building | 7–13 | Past tense, continuous tense, case markers, daily conversations |
| 3 — Fluency | 14–22 | Future tense, conditionals, modals, complex sentences |
