"use client";

import { CreateQuizForm } from "@/components/admin/create-quiz-form";
import { QuizDetail } from "@/components/admin/quiz-detail";
import { QuizList } from "@/components/admin/quiz-list";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Quiz } from "@/lib/types";
import { ArrowLeft, Plus, Radio } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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

  function renderMainContent() {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }
    if (view === "list") {
      return (
        <QuizList
          quizzes={quizzes}
          onSelect={handleSelectQuiz}
          onRefresh={fetchQuizzes}
        />
      );
    }
    if (view === "create") {
      return (
        <CreateQuizForm onCreated={handleQuizCreated} onCancel={handleBack} />
      );
    }
    if (selectedQuizId) {
      return <QuizDetail quizId={selectedQuizId} onBack={handleBack} />;
    }
    return null;
  }

  return (
    <div className="min-h-dvh bg-background">
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

      <main className="mx-auto max-w-5xl px-4 py-6">{renderMainContent()}</main>
    </div>
  );
}
