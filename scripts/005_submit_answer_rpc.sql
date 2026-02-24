-- Submit answer and score atomically to avoid race conditions.
-- Each participant's score is incremented in the DB (score = score + points)
-- so we never rely on client-cached score. is_correct is computed server-side
-- from questions.correct_option.

create or replace function public.submit_answer(
  p_quiz_id uuid,
  p_question_id uuid,
  p_participant_id uuid,
  p_selected_option int
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correct_option int;
  v_is_correct boolean;
  v_points int := 10;
  v_inserted_id uuid;
begin
  -- Get correct answer for this question (one row per question_id)
  select q.correct_option
  into v_correct_option
  from public.questions q
  where q.id = p_question_id and q.quiz_id = p_quiz_id;

  if v_correct_option is null then
    return jsonb_build_object('ok', false, 'error', 'question_not_found');
  end if;

  v_is_correct := (p_selected_option = v_correct_option);

  -- Insert answer. One row per (question_id, participant_id); skip if already answered.
  insert into public.answers (
    quiz_id, question_id, participant_id, selected_option, is_correct
  )
  values (p_quiz_id, p_question_id, p_participant_id, p_selected_option, v_is_correct)
  on conflict (question_id, participant_id) do nothing
  returning id into v_inserted_id;

  -- Only award points if we actually inserted (first answer) and it was correct
  if v_inserted_id is not null and v_is_correct then
    update public.participants
    set score = score + v_points
    where id = p_participant_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'inserted', (v_inserted_id is not null),
    'is_correct', v_is_correct
  );
end;
$$;

-- Allow public (anon) to call this; app uses client with anon key
grant execute on function public.submit_answer(uuid, uuid, uuid, int) to anon;
grant execute on function public.submit_answer(uuid, uuid, uuid, int) to service_role;
