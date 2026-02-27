"use client";

import { getRankedParticipants } from "@/lib/ranked-participants";
import { createClient } from "@/lib/supabase/client";
import type { Answer, Participant, Question, Quiz } from "@/lib/types";
import { Radio, Timer, Trophy, Users } from "lucide-react";
import QRCode from "qrcode";
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
  const [joinPageQrDataUrl, setJoinPageQrDataUrl] = useState<string | null>(
    null
  );
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number | null>(null);

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
          event: "*",
          schema: "public",
          table: "answers",
          filter: `quiz_id=eq.${quizId}`,
        },
        () => {
          const s = createClient();
          s.from("answers")
            .select("*")
            .eq("quiz_id", quizId)
            .then(({ data }) => {
              if (data) setAnswers(data);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [quizId]);

  // Countdown for current question so driver can see remaining time
  useEffect(() => {
    if (quiz?.status !== "question" && quiz?.status !== "active") {
      return;
    }
    if (questionTimeLeft === null || questionTimeLeft <= 0) return;
    const t = setInterval(() => {
      setQuestionTimeLeft((prev) =>
        prev !== null ? Math.max(0, prev - 1) : 0
      );
    }, 1000);
    return () => clearInterval(t);
  }, [quiz?.status, questionTimeLeft]);

  useEffect(() => {
    if (quiz?.status === "question" || quiz?.status === "active") {
      const q = questions[quiz.current_question_index];
      setQuestionTimeLeft(q?.time_limit ?? null);
    } else {
      setQuestionTimeLeft(null);
    }
  }, [quiz?.status, quiz?.current_question_index, questions]);

  // QR code: encodes app index URL only (single responsibility: redirect to join page).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!quiz?.code) return;
    const joinUrl = `${window.location.origin}/?code=${encodeURIComponent(
      quiz.code
    )}`;
    QRCode.toDataURL(joinUrl, { width: 280, margin: 2 })
      .then(setJoinPageQrDataUrl)
      .catch(() => setJoinPageQrDataUrl(null));
  }, [quiz?.code]);

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
    );
  }

  if (!quiz) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background text-muted-foreground">
        <p>Quiz not found.</p>
      </main>
    );
  }

  const status = quiz.status;
  const currentQuestion = questions[quiz.current_question_index] ?? null;
  const joinUrl =
    typeof window !== "undefined" ? `${window.location.origin}` : "";
  const currentAnswers = currentQuestion
    ? answers.filter((a) => a.question_id === currentQuestion.id)
    : [];
  const responseCount = currentAnswers.length;

  if (status === "lobby") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-12 py-16">
        <div className="flex flex-col items-center gap-16 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-primary-foreground">
              <Radio className="h-12 w-12" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Wavespace
            </h1>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex flex-col items-center gap-2">
              <p className="text-xl text-muted-foreground md:text-2xl">
                Join now at{" "}
                <span className="font-mono font-semibold text-foreground">
                  {joinUrl}
                </span>
              </p>
              <p className="text-xl text-muted-foreground">
                Enter code: {quiz.code}
              </p>
            </div>
          </div>
          {joinPageQrDataUrl && (
            <figure className="flex flex-col items-center gap-3">
              <img
                src={joinPageQrDataUrl}
                alt="Scan to open join page"
                width={280}
                height={280}
                className="rounded-xl border border-border bg-card p-2"
              />
              <figcaption className="text-lg text-muted-foreground">
                Scan to open join page
              </figcaption>
            </figure>
          )}
          <div className="flex items-center gap-3 rounded-2xl bg-card border border-border px-8 py-4">
            <Users className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold tabular-nums text-foreground md:text-4xl">
              {participants.length}
            </span>
            <span className="text-xl text-muted-foreground">
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
        <main className="flex min-h-dvh items-center justify-center bg-background text-muted-foreground">
          <p className="text-2xl">Waiting for question…</p>
        </main>
      );
    }
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-12 py-16">
        <div className="flex w-full max-w-5xl flex-col items-center gap-12 text-center">
          <p className="text-2xl font-medium text-muted-foreground md:text-3xl">
            Question {quiz.current_question_index + 1} of {questions.length}
          </p>
          <h2 className="text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl xl:text-7xl">
            {currentQuestion.question_text}
          </h2>
          {questionTimeLeft !== null && (
            <div
              className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-4 py-2 text-base"
              role="timer"
              aria-live="polite"
              aria-label={`Time left: ${questionTimeLeft} seconds`}
            >
              <Timer className="h-5 w-5 text-muted-foreground" />
              <span
                className={`font-bold tabular-nums ${
                  questionTimeLeft <= 5 ? "text-destructive" : "text-foreground"
                }`}
              >
                {questionTimeLeft}s
              </span>
            </div>
          )}
          <div
            className="rounded-2xl bg-card border border-border px-8 py-4"
            role="status"
            aria-live="polite"
          >
            <span className="text-3xl font-bold tabular-nums text-primary md:text-4xl">
              Responses: {responseCount}
            </span>
          </div>
        </div>
      </main>
    );
  }

  if (status === "results") {
    if (!currentQuestion) {
      return (
        <main className="flex min-h-dvh items-center justify-center bg-background text-muted-foreground">
          <p className="text-2xl">Revealing results…</p>
        </main>
      );
    }

    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-12 py-16">
        <div className="flex w-full max-w-5xl flex-col items-center gap-10 text-center">
          <div className="flex flex-col gap-4">
            <p className="text-2xl font-medium text-muted-foreground md:text-3xl">
              Results
            </p>
            <h2 className="text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl xl:text-7xl">
              {currentQuestion.question_text}
            </h2>
            <p className="text-lg text-muted-foreground">
              Time limit: {currentQuestion.time_limit}s
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 w-full">
            <div
              className="rounded-2xl bg-card border border-border px-8 py-4"
              role="status"
              aria-live="polite"
            >
              <span className="text-3xl font-bold tabular-nums text-primary md:text-4xl">
                Responses: {responseCount} / {participants.length}
              </span>
            </div>

            <div className="grid w-full max-w-3xl grid-cols-1 gap-3 md:grid-cols-2">
              {currentQuestion.options.map((option, index) => {
                const answerCount = currentAnswers.filter(
                  (answer) => answer.selected_option === index
                ).length;
                const isCorrect = index === currentQuestion.correct_option;

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-lg md:text-xl ${
                      isCorrect
                        ? "bg-[oklch(0.65_0.19_145)]/10 border border-[oklch(0.65_0.19_145)]/40"
                        : "bg-secondary border border-border/40"
                    }`}
                  >
                    <span
                      className={
                        isCorrect
                          ? "font-semibold text-foreground"
                          : "text-secondary-foreground"
                      }
                    >
                      {option}
                    </span>
                    <span className="text-xl font-bold tabular-nums text-foreground">
                      {answerCount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status === "leaderboard" || status === "finished") {
    const ranked = getRankedParticipants(participants);
    const top5 = ranked.slice(0, 5);
    const isFinished = status === "finished";

    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-12 py-16">
        <div className="flex w-full max-w-4xl flex-col items-center gap-12">
          <div className="flex flex-col items-center gap-4">
            <Trophy className="h-16 w-16 text-[oklch(0.7_0.17_55)] md:h-20 md:w-20" />
            <h2 className="text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
              {isFinished ? "Final Leaderboard" : "Leaderboard"}
            </h2>
          </div>
          <ul className="flex w-full flex-col gap-4">
            {top5.map(({ participant, rank }) => (
              <li
                key={participant.id}
                className="flex items-center justify-between rounded-2xl bg-card border border-border px-8 py-5 transition-all duration-300 ease-out"
              >
                <div className="flex items-center gap-6">
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold md:h-16 md:w-16 md:text-2xl ${getDriverRankClass(
                      rank
                    )}`}
                  >
                    {rank}
                  </span>
                  <span className="text-2xl font-semibold text-foreground md:text-3xl">
                    {participant.nickname}
                  </span>
                </div>
                <span className="text-3xl font-bold tabular-nums text-foreground md:text-4xl">
                  {participant.score}
                </span>
              </li>
            ))}
          </ul>
          {!isFinished && (
            <p className="text-xl text-muted-foreground">
              Next question coming up…
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background text-muted-foreground">
      <p className="text-2xl">Waiting for the host to start…</p>
    </main>
  );
}

function getDriverRankClass(rank: number): string {
  switch (rank) {
    case 1:
      return "bg-primary text-primary-foreground";
    case 2:
      return "bg-muted text-muted-foreground";
    case 3:
      return "bg-[oklch(0.7_0.17_55)] text-white";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}
