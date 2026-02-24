-- Submit answer and score atomically to avoid race conditions.
-- Each participant's score is incremented in the DB (score = score + points)
-- so we never rely on client-cached score. is_correct is computed server-side
-- from questions.correct_option.
-- Only accepts answers for the current question (quiz status question/active)
-- so all writes are recorded for the right question; 30-40s per question
-- gives time for Supabase to accept concurrent writes.

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
  v_quiz_status text;
  v_current_index int;
  v_current_question_id uuid;
  v_participant_quiz_id uuid;
  v_correct_option int;
  v_is_correct boolean;
  v_points int := 10;
  v_inserted_id uuid;
begin
  -- Verify participant belongs to this quiz (keeps data consistent)
  select quiz_id into v_participant_quiz_id
  from public.participants
  where id = p_participant_id;

  if v_participant_quiz_id is null or v_participant_quiz_id != p_quiz_id then
    return jsonb_build_object('ok', false, 'error', 'participant_not_in_quiz');
  end if;

  -- Only accept answers while this question is live (status question/active, current question)
  select q.status, q.current_question_index
  into v_quiz_status, v_current_index
  from public.quizzes q
  where q.id = p_quiz_id;

  if v_quiz_status is null then
    return jsonb_build_object('ok', false, 'error', 'quiz_not_found');
  end if;

  if v_quiz_status not in ('question', 'active') then
    return jsonb_build_object('ok', false, 'error', 'question_not_current');
  end if;

  select id into v_current_question_id
  from public.questions
  where quiz_id = p_quiz_id
  order by sort_order
  offset v_current_index
  limit 1;

  if v_current_question_id is null or v_current_question_id != p_question_id then
    return jsonb_build_object('ok', false, 'error', 'question_not_current');
  end if;

  -- Get correct answer for this question
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
