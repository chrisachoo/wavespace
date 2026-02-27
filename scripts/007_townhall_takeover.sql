INSERT INTO public.quizzes (id, title, code, status, current_question_index)
VALUES (
  '7a27bc0e-71d9-477f-867e-205a2e674336',
  'Cars.co.za Tech Team Townhall Takeover 2026',
  'E7S5R6',
  'draft',
  0
)
ON CONFLICT (id) DO NOTHING;

DELETE FROM public.questions
WHERE quiz_id = '7a27bc0e-71d9-477f-867e-205a2e674336';

INSERT INTO public.questions (quiz_id, question_text, options, correct_option, time_limit, sort_order)
VALUES
  (
    '7a27bc0e-71d9-477f-867e-205a2e674336',
    'Which operating system is responsible for the most downloads of the Cars.co.za app?',
    '["iOS (Apple)", "Play Store (Android)", "App Gallery (Huawei)", "Samsung Galaxy Store"]'::jsonb,
    1,
    30,
    0
  ),
  (
    '7a27bc0e-71d9-477f-867e-205a2e674336',
    'Which of the following is NOT a real tool or section currently on the Cars.co.za website?',
    '["Car Finance Calculator", "Motoring News & Reviews", "Buy a Boat", "Bike Search"]'::jsonb,
    2,
    30,
    0
  ),
  (
    '7a27bc0e-71d9-477f-867e-205a2e674336',
    'What does the "www" at the beginning of our website address actually stand for?',
    '["World Wide Web", "Western Web Window", "World Web Widgets", "Web Wide World"]'::jsonb,
    0,
    30,
    1
  ),
  (
    '7a27bc0e-71d9-477f-867e-205a2e674336',
    'In the tech world, when we say we are improving the "UI" of the Cars.co.za app, what does "UI" stand for?',
    '["Universal Internet", "User Interface", "Unlimited Information", "Upload Index"]'::jsonb,
    1,
    30,
    2
  ),
  (
    '7a27bc0e-71d9-477f-867e-205a2e674336',
    'In 1997, the first ever car was sold on the internet. What brand was it?',
    '["Toyota", "Ford", "Nissan", "Volkswagen"]'::jsonb,
    1,
    30,
    3
  ),
  (
    '7a27bc0e-71d9-477f-867e-205a2e674336',
    'According to South African law, what is the one emergency item you are legally required to carry in your car at all times?',
    '["Jumper cables", "A spare tyre", "A fire extinguisher", "A warning triangle"]'::jsonb,
    3,
    30,
    4
  ),
  (
    '7a27bc0e-71d9-477f-867e-205a2e674336',
    'What do we call the little pieces of data that websites (like Cars.co.za) save on your browser so we can remember your preferences?',
    '["Brownies", "Biscuits", "Cookies", "Cupcakes"]'::jsonb,
    2,
    30,
    5
  ),
  (
    '7a27bc0e-71d9-477f-867e-205a2e674336',
    'What does "Wi-Fi" actually stand for?',
    '["Wireless Fidelity", "Wired Fiber", "Wireless Fire", "Absolutely nothing"]'::jsonb,
    3,
    30,
    6
  ),
  (
    '7a27bc0e-71d9-477f-867e-205a2e674336',
    'Let''s look at some global car data. Statistically, what is the most popular car colour in the world (and here in South Africa)?',
    '["Silver", "Black", "White", "Red"]'::jsonb,
    2,
    30,
    7
  ),
  (
    '7a27bc0e-71d9-477f-867e-205a2e674336',
    'In the data world, what do we call a visual display that summarizes complex information using charts and graphs so it''s easy to read at a glance?',
    '["A Dashboard", "A Windshield", "A Rearview Mirror", "A Cubbyhole"]'::jsonb,
    0,
    30,
    8
  ),
  (
    '7a27bc0e-71d9-477f-867e-205a2e674336',
    'We are officially launching our Zoho CRM soon. What does "CRM" actually stand for?',
    '["Car Racing Mechanics", "Customer Relationship Management", "Company Revenue Maker", "Central Record Monitor"]'::jsonb,
    1,
    30,
    9
  ),
  (
    '7a27bc0e-71d9-477f-867e-205a2e674336',
    'Which team won the F1 Constructors'' Championship in 2025?',
    '["Ferrari", "Red Bull", "McLaren", "Mercedes"]'::jsonb,
    2,
    30,
    10
  ),
  (
    '7a27bc0e-71d9-477f-867e-205a2e674336',
    'True or False: Over the last six months, the Cars.co.za Tech Team has run entirely on coffee, code, and sheer willpower?',
    '["True", "False"]'::jsonb,
    0,
    30,
    11
  );
