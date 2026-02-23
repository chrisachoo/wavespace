"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getQuizStatusBadgeClass } from "@/lib/quiz-status";
import { createClient } from "@/lib/supabase/client";
import type { Answer, Participant, Question, Quiz } from "@/lib/types";
import {
  BarChart3,
  CheckCircle2,
  Copy,
  Play,
  RotateCcw,
  SkipForward,
  Square,
  Trophy,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface QuizDetailProps {
  quizId: string;
  onBack: () => void;
}

export function QuizDetail({ quizId, onBack }: Readonly<QuizDetailProps>) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [restartMessage, setRestartMessage] = useState(false);

  const openLobbyRef = useRef<HTMLButtonElement>(null);
  const startQuizRef = useRef<HTMLButtonElement>(null);
  const showResultsRef = useRef<HTMLButtonElement>(null);
  const showLeaderboardRef = useRef<HTMLButtonElement>(null);
  const nextQuestionRef = useRef<HTMLButtonElement>(null);
  const endQuizRef = useRef<HTMLButtonElement>(null);

  const fetchAll = useCallback(async () => {
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
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`admin-quiz-${quizId}`)
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

  useEffect(() => {
    if (loading || !quiz) return;
    const s = quiz.status;
    const isLast =
      questions.length > 0 &&
      quiz.current_question_index >= questions.length - 1;

    const ref =
      s === "draft"
        ? openLobbyRef.current
        : s === "lobby"
        ? startQuizRef.current
        : s === "question"
        ? showResultsRef.current
        : s === "results"
        ? showLeaderboardRef.current
        : s === "leaderboard" && !isLast
        ? nextQuestionRef.current
        : s === "leaderboard" && isLast
        ? endQuizRef.current
        : null;
    ref?.focus();
  }, [loading, quiz?.status, quiz?.current_question_index, questions.length]);

  async function updateQuizStatus(
    status: Quiz["status"],
    questionIndex?: number
  ) {
    const supabase = createClient();
    const updates: Partial<Quiz> = { status };
    if (questionIndex !== undefined) {
      updates.current_question_index = questionIndex;
    }
    const { data } = await supabase
      .from("quizzes")
      .update(updates)
      .eq("id", quizId)
      .select("*")
      .single();
    if (data) setQuiz(data);
  }

  async function handleOpenLobby() {
    await updateQuizStatus("lobby");
  }

  async function handleStartFirstQuestion() {
    await updateQuizStatus("question", 0);
  }

  async function handleShowResults() {
    await updateQuizStatus("results");
  }

  async function handleShowLeaderboard() {
    await updateQuizStatus("leaderboard");
  }

  async function handleNextQuestion() {
    if (!quiz) return;
    const nextIndex = quiz.current_question_index + 1;
    if (nextIndex < questions.length) {
      await updateQuizStatus("question", nextIndex);
    }
  }

  async function handleFinish() {
    await updateQuizStatus("finished");
  }

  async function handleRestart() {
    if (!quiz) return;
    setRestarting(true);
    try {
      const supabase = createClient();
      await supabase.from("answers").delete().eq("quiz_id", quizId);
      await supabase.from("participants").delete().eq("quiz_id", quizId);
      await updateQuizStatus("draft", 0);
      setAnswers([]);
      setParticipants([]);
      setRestartMessage(true);
      setTimeout(() => setRestartMessage(false), 4000);
    } finally {
      setRestarting(false);
    }
  }

  if (loading || !quiz) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const currentQuestion = questions[quiz.current_question_index] || null;
  const currentAnswers = currentQuestion
    ? answers.filter((a) => a.question_id === currentQuestion.id)
    : [];
  const isLastQuestion = quiz.current_question_index >= questions.length - 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl font-bold text-foreground">{quiz.title}</h2>
          <div className="flex items-center gap-2">
            <Badge
              className={`border-0 capitalize ${getQuizStatusBadgeClass(
                quiz.status
              )}`}
            >
              {quiz.status}
            </Badge>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(quiz.code);
                setCodeCopied(true);
                setTimeout(() => setCodeCopied(false), 2000);
              }}
              className="flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-sm font-mono text-secondary-foreground hover:bg-muted transition-colors"
              title="Copy code"
            >
              {quiz.code}
              {codeCopied ? (
                <span className="text-xs text-primary">Copied!</span>
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {participants.length} players
          </span>
          <span>{questions.length} questions</span>
        </div>
      </div>

      <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
        <h3 className="text-base font-semibold text-foreground mb-1">
          Host controls
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {quiz.status === "draft" &&
            "Open the lobby so players can join with the quiz code."}
          {quiz.status === "lobby" && "Start the quiz when everyone is in."}
          {quiz.status === "question" &&
            "When most have answered (or time is up), click below to show results and then move to the next question."}
          {quiz.status === "results" &&
            "Reveal the leaderboard, then go to next question or end the quiz."}
          {quiz.status === "leaderboard" &&
            !isLastQuestion &&
            "Go to the next question or end the quiz after the last one."}
          {quiz.status === "leaderboard" &&
            isLastQuestion &&
            "This was the last question. End the quiz to show final results."}
          {quiz.status === "finished" && "This quiz is over."}
        </p>
        <div className="flex flex-wrap gap-3">
          {quiz.status === "draft" && (
            <Button ref={openLobbyRef} onClick={handleOpenLobby} size="default">
              <Play className="h-4 w-4" />
              Open Lobby
            </Button>
          )}
          {quiz.status === "lobby" && (
            <Button
              ref={startQuizRef}
              onClick={handleStartFirstQuestion}
              size="default"
            >
              <Play className="h-4 w-4" />
              Start Quiz
            </Button>
          )}
          {quiz.status === "question" && (
            <Button
              ref={showResultsRef}
              onClick={handleShowResults}
              size="default"
              className="min-w-45"
            >
              <BarChart3 className="h-4 w-4" />
              Show Results
            </Button>
          )}
          {quiz.status === "results" && (
            <Button
              ref={showLeaderboardRef}
              onClick={handleShowLeaderboard}
              size="default"
              className="min-w-45"
            >
              <Trophy className="h-4 w-4" />
              Show Leaderboard
            </Button>
          )}
          {quiz.status === "leaderboard" && !isLastQuestion && (
            <Button
              ref={nextQuestionRef}
              onClick={handleNextQuestion}
              size="default"
              className="min-w-45"
            >
              <SkipForward className="h-4 w-4" />
              Next Question
            </Button>
          )}
          {quiz.status === "leaderboard" && isLastQuestion && (
            <Button
              ref={endQuizRef}
              onClick={handleFinish}
              size="default"
              variant="destructive"
              className="min-w-45"
            >
              <Square className="h-4 w-4" />
              End Quiz
            </Button>
          )}
          {quiz.status === "finished" && (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted-foreground py-1">
                Quiz is finished.
              </p>
              <Button
                variant="outline"
                size="default"
                onClick={handleRestart}
                disabled={restarting}
              >
                <RotateCcw className="h-4 w-4" />
                {restarting ? "Restarting…" : "Restart quiz"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {restartMessage && (
        <div
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-300"
          role="status"
        >
          Quiz restarted. You can open the lobby and run it again.
        </div>
      )}

      {currentQuestion &&
        (quiz.status === "question" || quiz.status === "results") && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Q{quiz.current_question_index + 1}:{" "}
                {currentQuestion.question_text}
              </h3>
              <span className="text-xs text-muted-foreground">
                {currentAnswers.length} / {participants.length} answered
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {currentQuestion.options.map((opt, i) => {
                const answerCount = currentAnswers.filter(
                  (a) => a.selected_option === i
                ).length;
                const isCorrect = i === currentQuestion.correct_option;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                      isCorrect
                        ? "bg-[oklch(0.65_0.19_145)]/10 border border-[oklch(0.65_0.19_145)]/30"
                        : "bg-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isCorrect && (
                        <CheckCircle2 className="h-4 w-4 text-[oklch(0.55_0.21_145)]" />
                      )}
                      <span
                        className={
                          isCorrect
                            ? "font-medium text-foreground"
                            : "text-secondary-foreground"
                        }
                      >
                        {opt}
                      </span>
                    </div>
                    <span className="text-xs font-bold tabular-nums text-muted-foreground">
                      {answerCount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Players</h3>
        {participants.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No players have joined yet.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {participants.map((p, index) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {p.nickname}
                  </span>
                </div>
                <span className="text-sm font-bold tabular-nums text-foreground">
                  {p.score} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Questions
        </h3>
        <div className="flex flex-col gap-2">
          {questions.map((q, i) => {
            const isCurrent = i === quiz.current_question_index;
            const isPast =
              quiz.status !== "draft" &&
              quiz.status !== "lobby" &&
              i < quiz.current_question_index;
            return (
              <div
                key={q.id}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                  isCurrent &&
                  quiz.status !== "draft" &&
                  quiz.status !== "lobby"
                    ? "bg-primary/10 border border-primary/20"
                    : isPast
                    ? "bg-muted/50 text-muted-foreground"
                    : "bg-secondary/50"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isCurrent &&
                    quiz.status !== "draft" &&
                    quiz.status !== "lobby"
                      ? "bg-primary text-primary-foreground"
                      : isPast
                      ? "bg-muted text-muted-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={
                    isPast ? "text-muted-foreground" : "text-foreground"
                  }
                >
                  {q.question_text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Button variant="outline" onClick={onBack} className="self-start">
        Back to Quizzes
      </Button>
    </div>
  );
}
