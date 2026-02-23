-- Wavespace Database Schema

-- Quizzes table: the central table that drives realtime sync
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  code text not null unique,
  status text not null default 'draft' check (status in ('draft', 'lobby', 'active', 'question', 'results', 'leaderboard', 'finished')),
  current_question_index int default 0,
  created_at timestamptz default now()
);

-- Questions table: stores each question for a quiz
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  options jsonb not null default '[]'::jsonb,
  correct_option int not null,
  time_limit int not null default 20,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

-- Participants table: tracks who joined a quiz
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  nickname text not null,
  score int not null default 0,
  created_at timestamptz default now()
);

-- Answers table: stores each participant's answer per question
create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  selected_option int not null,
  is_correct boolean not null default false,
  answered_at timestamptz default now(),
  unique(question_id, participant_id)
);

-- Enable RLS on all tables
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.participants enable row level security;
alter table public.answers enable row level security;

-- Quizzes: allow public read, insert, update (no auth in this app)
create policy "Allow public read quizzes" on public.quizzes for select using (true);
create policy "Allow public insert quizzes" on public.quizzes for insert with check (true);
create policy "Allow public update quizzes" on public.quizzes for update using (true);
create policy "Allow public delete quizzes" on public.quizzes for delete using (true);

-- Questions: allow public read, insert, update, delete
create policy "Allow public read questions" on public.questions for select using (true);
create policy "Allow public insert questions" on public.questions for insert with check (true);
create policy "Allow public update questions" on public.questions for update using (true);
create policy "Allow public delete questions" on public.questions for delete using (true);

-- Participants: allow public read, insert, update, delete (delete for quiz restart)
create policy "Allow public read participants" on public.participants for select using (true);
create policy "Allow public insert participants" on public.participants for insert with check (true);
create policy "Allow public update participants" on public.participants for update using (true);
create policy "Allow public delete participants" on public.participants for delete using (true);

-- Answers: allow public read, insert, delete (delete for quiz restart)
create policy "Allow public read answers" on public.answers for select using (true);
create policy "Allow public insert answers" on public.answers for insert with check (true);
create policy "Allow public delete answers" on public.answers for delete using (true);

-- Enable realtime on quizzes table (used for live sync)
alter publication supabase_realtime add table public.quizzes;
alter publication supabase_realtime add table public.participants;
alter publication supabase_realtime add table public.answers;

-- Index for fast quiz code lookups
create index if not exists idx_quizzes_code on public.quizzes(code);
create index if not exists idx_questions_quiz_id on public.questions(quiz_id);
create index if not exists idx_participants_quiz_id on public.participants(quiz_id);
create index if not exists idx_answers_quiz_id on public.answers(quiz_id);
