INSERT INTO public.quizzes (id, title, code, status, current_question_index)
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  'General Knowledge',
  'GENK1',
  'draft',
  0
)
ON CONFLICT (id) DO NOTHING;

DELETE FROM public.questions
WHERE quiz_id = 'b2c3d4e5-f6a7-8901-bcde-f23456789012';

INSERT INTO public.questions (quiz_id, question_text, options, correct_option, time_limit, sort_order)
VALUES
  (
    'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    'What is the largest planet in our solar system?',
    '["Mars", "Saturn", "Jupiter", "Neptune"]'::jsonb,
    2,
    20,
    0
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    'In which year did the first human land on the Moon?',
    '["1965", "1969", "1971", "1973"]'::jsonb,
    1,
    20,
    1
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    'What is the capital of Japan?',
    '["Seoul", "Beijing", "Tokyo", "Bangkok"]'::jsonb,
    2,
    15,
    2
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    'Which gas do plants absorb from the air for photosynthesis?',
    '["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"]'::jsonb,
    2,
    20,
    3
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    'How many continents are there on Earth?',
    '["5", "6", "7", "8"]'::jsonb,
    2,
    15,
    4
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    'Who wrote "Romeo and Juliet"?',
    '["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"]'::jsonb,
    1,
    20,
    5
  );
