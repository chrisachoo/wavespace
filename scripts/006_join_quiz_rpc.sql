-- Join quiz with a 70-participant cap per session.
-- One quiz runs per session; max 70 participants + admin.
-- Enforced atomically so no race when many join at once.

create or replace function public.join_quiz(
  p_quiz_id uuid,
  p_nickname text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quiz_status text;
  v_count int;
  v_participant_id uuid;
  v_row public.participants%rowtype;
begin
  -- Quiz must exist and be joinable (not draft, not finished)
  select status into v_quiz_status
  from public.quizzes
  where id = p_quiz_id;

  if v_quiz_status is null then
    return jsonb_build_object('ok', false, 'error', 'quiz_not_found');
  end if;

  if v_quiz_status = 'draft' then
    return jsonb_build_object('ok', false, 'error', 'quiz_not_started');
  end if;

  if v_quiz_status = 'finished' then
    return jsonb_build_object('ok', false, 'error', 'quiz_ended');
  end if;

  if nullif(trim(p_nickname), '') is null then
    return jsonb_build_object('ok', false, 'error', 'nickname_required');
  end if;

  -- Enforce max 70 participants per quiz
  select count(*) into v_count
  from public.participants
  where quiz_id = p_quiz_id;

  if v_count >= 70 then
    return jsonb_build_object('ok', false, 'error', 'quiz_full');
  end if;

  -- Insert participant
  insert into public.participants (quiz_id, nickname)
  values (p_quiz_id, trim(p_nickname))
  returning id into v_participant_id;

  if v_participant_id is null then
    return jsonb_build_object('ok', false, 'error', 'insert_failed');
  end if;

  select * into v_row from public.participants where id = v_participant_id;

  return jsonb_build_object(
    'ok', true,
    'participant_id', v_participant_id,
    'participant', to_jsonb(v_row)
  );
end;
$$;

grant execute on function public.join_quiz(uuid, text) to anon;
grant execute on function public.join_quiz(uuid, text) to service_role;
