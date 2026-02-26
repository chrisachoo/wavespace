"use client";

import { getRankedParticipants } from "@/lib/ranked-participants";
import { createClient } from "@/lib/supabase/client";
import type { Answer, Participant, Question, Quiz } from "@/lib/types";
import { Radio, Trophy, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface DriverClientProps {
  quizId: string;
}

export function DriverClient({ quizId }: Readonly<DriverClientProps>) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const [quizRes, questionsRes, participantsRes, answersRes] =
      await Promise.all([
        supabase.from("quizzes").select("*").eq("id", quizId).single(),
        supabase
          .from("questions")
          .select("*")
          .eq("quiz_id", quizId)
          .order("sort_order"),
        supabase
          .from("participants")
          .select("*")
          .eq("quiz_id", quizId)
          .order("score", { ascending: false }),
        supabase.from("answers").select("*").eq("quiz_id", quizId),
      ]);

    if (quizRes.data) setQuiz(quizRes.data);
    if (questionsRes.data) setQuestions(questionsRes.data);
    if (participantsRes.data) setParticipants(participantsRes.data);
    if (answersRes.data) setAnswers(answersRes.data);
    setLoading(false);
  }, [quizId]);

  useEffect(() => {
    const tid = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(tid);
  }, [fetchData]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`driver-quiz-${quizId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "quizzes",
          filter: `id=eq.${quizId}`,
        },
        (payload) => {
          setQuiz(payload.new as Quiz);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
          filter: `quiz_id=eq.${quizId}`,
        },
        () => {
          const s = createClient();
          s.from("participants")
            .select("*")
            .eq("quiz_id", quizId)
            .order("score", { ascending: false })
            .then(({ data }) => {
              if (data) setParticipants(data);
            });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "answers",
          filter: `quiz_id=eq.${quizId}`,
        },
        (payload) => {
          setAnswers((prev) => [...prev, payload.new as Answer]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [quizId]);

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-zinc-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
      </main>
    );
  }

  if (!quiz) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-zinc-950 text-zinc-400">
        <p>Quiz not found.</p>
      </main>
    );
  }

  const status = quiz.status;
  const currentQuestion = questions[quiz.current_question_index] ?? null;
  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}`
      : "";
  const currentAnswers = currentQuestion
    ? answers.filter((a) => a.question_id === currentQuestion.id)
    : [];
  const responseCount = currentAnswers.length;

  if (status === "lobby") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 px-12 py-16">
        <div className="flex flex-col items-center gap-16 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-teal-600 text-white">
              <Radio className="h-12 w-12" />
            </div>
            <h1 className="text-6xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl">
              Wavespace
            </h1>
          </div>
          <p className="text-2xl text-zinc-400 md:text-3xl lg:text-4xl">
            Join now at{" "}
            <span className="font-mono font-semibold text-white">{joinUrl}</span>
          </p>
          <p className="text-xl text-zinc-500">Enter code: {quiz.code}</p>
          <div className="flex items-center gap-3 rounded-2xl bg-zinc-900 px-8 py-4">
            <Users className="h-10 w-10 text-teal-400" />
            <span className="text-3xl font-bold tabular-nums text-white md:text-4xl">
              {participants.length}
            </span>
            <span className="text-xl text-zinc-400">
              {participants.length === 1 ? "participant" : "participants"}
            </span>
          </div>
        </div>
      </main>
    );
  }

  if (status === "question" || status === "active") {
    if (!currentQuestion) {
      return (
        <main className="flex min-h-dvh items-center justify-center bg-zinc-950 text-zinc-400">
          <p className="text-2xl">Waiting for question…</p>
        </main>
      );
    }
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 px-12 py-16">
        <div className="flex w-full max-w-5xl flex-col items-center gap-12 text-center">
          <p className="text-2xl font-medium text-zinc-500 md:text-3xl">
            Question {quiz.current_question_index + 1} of {questions.length}
          </p>
          <h2 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl xl:text-7xl">
            {currentQuestion.question_text}
          </h2>
          <div
            className="rounded-2xl bg-zinc-900 px-8 py-4"
            role="status"
            aria-live="polite"
          >
            <span className="text-3xl font-bold tabular-nums text-teal-400 md:text-4xl">
              Responses: {responseCount}
            </span>
          </div>
        </div>
      </main>
    );
  }

  if (status === "results") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 px-12 py-16">
        <div className="flex flex-col items-center gap-8 text-center">
          {currentQuestion && (
            <p className="text-3xl text-zinc-400 md:text-4xl">
              {currentQuestion.question_text}
            </p>
          )}
          <p className="text-2xl font-medium text-white md:text-3xl">
            Revealing results…
          </p>
        </div>
      </main>
    );
  }

  if (status === "leaderboard" || status === "finished") {
    const ranked = getRankedParticipants(participants);
    const top5 = ranked.slice(0, 5);
    const isFinished = status === "finished";

    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 px-12 py-16">
        <div className="flex w-full max-w-4xl flex-col items-center gap-12">
          <div className="flex flex-col items-center gap-4">
            <Trophy className="h-16 w-16 text-amber-500 md:h-20 md:w-20" />
            <h2 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              {isFinished ? "Final Leaderboard" : "Leaderboard"}
            </h2>
          </div>
          <ul className="flex w-full flex-col gap-4">
            {top5.map(({ participant, rank }) => (
              <li
                key={participant.id}
                className="flex items-center justify-between rounded-2xl bg-zinc-900 px-8 py-5 transition-all duration-300 ease-out"
              >
                <div className="flex items-center gap-6">
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold md:h-16 md:w-16 md:text-2xl ${getDriverRankClass(rank)}`}
                  >
                    {rank}
                  </span>
                  <span className="text-2xl font-semibold text-white md:text-3xl">
                    {participant.nickname}
                  </span>
                </div>
                <span className="text-3xl font-bold tabular-nums text-white md:text-4xl">
                  {participant.score}
                </span>
              </li>
            ))}
          </ul>
          {!isFinished && (
            <p className="text-xl text-zinc-500">Next question coming up…</p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-950 text-zinc-400">
      <p className="text-2xl">Waiting for the host to start…</p>
    </main>
  );
}

function getDriverRankClass(rank: number): string {
  switch (rank) {
    case 1:
      return "bg-amber-500 text-white";
    case 2:
      return "bg-zinc-500 text-white";
    case 3:
      return "bg-amber-700 text-white";
    default:
      return "bg-zinc-700 text-zinc-300";
  }
}
