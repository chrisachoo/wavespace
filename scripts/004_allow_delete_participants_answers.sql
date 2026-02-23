-- Run this if Restart quiz fails (RLS: policy missing). Adds delete for participants and answers.
create policy "Allow public delete participants" on public.participants for delete using (true);
create policy "Allow public delete answers" on public.answers for delete using (true);
