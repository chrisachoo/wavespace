export interface Quiz {
  id: string;
  title: string;
  code: string;
  status:
    | "draft"
    | "lobby"
    | "active"
    | "question"
    | "results"
    | "leaderboard"
    | "finished";
  current_question_index: number;
  created_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_option: number;
  time_limit: number;
  sort_order: number;
  created_at: string;
}

export interface Participant {
  id: string;
  quiz_id: string;
  nickname: string;
  score: number;
  created_at: string;
}

export interface Answer {
  id: string;
  quiz_id: string;
  question_id: string;
  participant_id: string;
  selected_option: number;
  is_correct: boolean;
  answered_at: string;
}
