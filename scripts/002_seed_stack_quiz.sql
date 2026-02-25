-- Seed: "Know Your Stack" quiz about the Wavespace tech stack
-- Idempotent: safe to run multiple times (quiz ON CONFLICT DO NOTHING; questions replaced).

-- Insert the quiz with a memorable code
INSERT INTO public.quizzes (id, title, code, status, current_question_index)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Know Your Stack',
  'STACK1',
  'draft',
  0
)
ON CONFLICT (id) DO NOTHING;

-- Replace questions for this quiz so re-runs don't duplicate
DELETE FROM public.questions
WHERE quiz_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Insert 5 questions about the stack
INSERT INTO public.questions (quiz_id, question_text, options, correct_option, time_limit, sort_order)
VALUES
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Which framework powers Wavespace?',
    '["Next.js", "Remix", "Nuxt.js", "SvelteKit"]'::jsonb,
    0,
    40,
    0
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'What database and realtime service does Wavespace use?',
    '["Firebase", "Supabase", "PlanetScale", "MongoDB Atlas"]'::jsonb,
    1,
    40,
    1
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Which CSS framework styles the Wavespace UI?',
    '["Bootstrap", "Mantine UI", "Tailwind CSS", "Material UI"]'::jsonb,
    2,
    40,
    2
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'What font family does Wavespace use for its typography?',
    '["Inter", "Geist", "JetBrains Mono", "Poppins"]'::jsonb,
    2,
    40,
    3
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Which Supabase feature enables live quiz synchronisation between admin and players?',
    '["Supabase Storage", "Supabase Edge Functions", "Supabase Realtime", "Supabase Vault"]'::jsonb,
    2,
    40,
    4
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'What is the primary language of the Wavespace codebase?',
    '["TypeScript", "JavaScript", "Python", "Ruby"]'::jsonb,
    0,
    40,
    5
  );
