"use client";

import { FinishedScreen } from "@/components/play/finished-screen";
import { LeaderboardScreen } from "@/components/play/leaderboard-screen";
import { LobbyScreen } from "@/components/play/lobby-screen";
import { QuestionScreen } from "@/components/play/question-screen";
import { ResultsScreen } from "@/components/play/results-screen";
import { createClient } from "@/lib/supabase/client";
import type { Participant, Question, Quiz } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

interface PlayClientProps {
  quizId: string;
  participantId: string;
}

export function PlayClient({
  quizId,
  participantId,
}: Readonly<PlayClientProps>) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentParticipant, setCurrentParticipant] =
    useState<Participant | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    const [quizRes, questionsRes, participantsRes, participantRes] =
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
        supabase
          .from("participants")
          .select("*")
          .eq("id", participantId)
          .single(),
      ]);

    if (quizRes.data) setQuiz(quizRes.data);
    if (questionsRes.data) setQuestions(questionsRes.data);
    if (participantsRes.data) setParticipants(participantsRes.data);
    if (participantRes.data) setCurrentParticipant(participantRes.data);
    setLoading(false);
  }, [quizId, participantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!quiz) {
      document.title = "Quiz | Wavespace";
      return;
    }
    const status = quiz.status;
    if (status === "lobby") document.title = "Lobby | Wavespace";
    else if (status === "question" || status === "active")
      document.title = `Q${quiz.current_question_index + 1} | Wavespace`;
    else if (status === "results") document.title = "Results | Wavespace";
    else if (status === "leaderboard")
      document.title = "Leaderboard | Wavespace";
    else if (status === "finished")
      document.title = "Quiz complete | Wavespace";
    else document.title = "Quiz | Wavespace";
    return () => {
      document.title = "Wavespace";
    };
  }, [quiz?.status, quiz?.current_question_index]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`quiz-${quizId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "quizzes",
          filter: `id=eq.${quizId}`,
        },
        (payload) => {
          const updated = payload.new as Quiz;
          setQuiz(updated);
          if (updated.status === "question") {
            setHasAnswered(false);
            setSelectedOption(null);
          }
          if (
            updated.status === "results" ||
            updated.status === "leaderboard" ||
            updated.status === "finished"
          ) {
            fetchData();
          }
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
          const supabase2 = createClient();
          supabase2
            .from("participants")
            .select("*")
            .eq("quiz_id", quizId)
            .order("score", { ascending: false })
            .then(({ data }) => {
              if (data) setParticipants(data);
            });
          supabase2
            .from("participants")
            .select("*")
            .eq("id", participantId)
            .single()
            .then(({ data }) => {
              if (data) setCurrentParticipant(data);
            });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setReconnecting(false);
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
          setReconnecting(true);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [quizId, participantId, fetchData]);

  async function handleAnswer(optionIndex: number) {
    if (hasAnswered || !quiz || !questions.length) return;

    const currentQuestion = questions[quiz.current_question_index];
    if (!currentQuestion) return;

    setHasAnswered(true);
    setSelectedOption(optionIndex);

    const supabase = createClient();
    await supabase.rpc("submit_answer", {
      p_quiz_id: quizId,
      p_question_id: currentQuestion.id,
      p_participant_id: participantId,
      p_selected_option: optionIndex,
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading quiz...</p>
        </div>
      </main>
    );
  }

  if (!quiz) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-muted-foreground">Quiz not found.</p>
      </main>
    );
  }

  const currentQuestion = questions[quiz.current_question_index] || null;

  return (
    <>
      {reconnecting && (
        <div
          className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 px-4 py-2 text-center text-sm font-medium text-amber-950"
          role="status"
          aria-live="polite"
        >
          Reconnecting…
        </div>
      )}
      {(() => {
        switch (quiz.status) {
          case "lobby":
            return (
              <LobbyScreen
                quiz={quiz}
                participants={participants}
                nickname={currentParticipant?.nickname || ""}
              />
            );
          case "question":
          case "active":
            return (
              <QuestionScreen
                question={currentQuestion}
                questionIndex={quiz.current_question_index}
                totalQuestions={questions.length}
                hasAnswered={hasAnswered}
                selectedOption={selectedOption}
                onAnswer={handleAnswer}
              />
            );
          case "results":
            return (
              <ResultsScreen
                question={currentQuestion}
                selectedOption={selectedOption}
                participant={currentParticipant}
              />
            );
          case "leaderboard":
            return (
              <LeaderboardScreen
                participants={participants}
                currentParticipantId={participantId}
              />
            );
          case "finished":
            return (
              <FinishedScreen
                participants={participants}
                currentParticipantId={participantId}
              />
            );
          default:
            return (
              <main className="flex min-h-dvh items-center justify-center bg-background">
                <p className="text-muted-foreground">
                  {"Waiting for the host to start..."}
                </p>
              </main>
            );
        }
      })()}
    </>
  );
}
