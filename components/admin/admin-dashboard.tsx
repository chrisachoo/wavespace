"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Quiz } from "@/lib/types";
import { CreateQuizForm } from "@/components/admin/create-quiz-form";
import { QuizList } from "@/components/admin/quiz-list";
import { QuizDetail } from "@/components/admin/quiz-detail";
import { Radio, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type View = "list" | "create" | "detail";

export function AdminDashboard() {
  const [view, setView] = useState<View>("list");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("quizzes")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setQuizzes(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  function handleSelectQuiz(quizId: string) {
    setSelectedQuizId(quizId);
    setView("detail");
  }

  function handleBack() {
    setSelectedQuizId(null);
    setView("list");
    fetchQuizzes();
  }

  function handleQuizCreated(quizId: string) {
    setSelectedQuizId(quizId);
    setView("detail");
    fetchQuizzes();
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {view !== "list" && (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Go back</span>
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Radio className="h-4 w-4" />
              </div>
              <span className="font-bold text-foreground">Wavespace Admin</span>
            </div>
          </div>
          {view === "list" && (
            <Button size="sm" onClick={() => setView("create")}>
              <Plus className="h-4 w-4" />
              New Quiz
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : view === "list" ? (
          <QuizList quizzes={quizzes} onSelect={handleSelectQuiz} onRefresh={fetchQuizzes} />
        ) : view === "create" ? (
          <CreateQuizForm onCreated={handleQuizCreated} onCancel={handleBack} />
        ) : selectedQuizId ? (
          <QuizDetail quizId={selectedQuizId} onBack={handleBack} />
        ) : null}
      </main>
    </div>
  );
}
