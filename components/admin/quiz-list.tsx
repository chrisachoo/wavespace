"use client";

import { DeleteQuizDialog } from "@/components/admin/delete-quiz-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getQuizStatusBadgeClass } from "@/lib/quiz-status";
import { createClient } from "@/lib/supabase/client";
import type { Quiz } from "@/lib/types";
import { Copy, FileText, Trash2 } from "lucide-react";
import { useState } from "react";

interface QuizListProps {
  quizzes: Quiz[];
  onSelect: (quizId: string) => void;
  onRefresh: () => void;
}

export function QuizList({ quizzes, onSelect, onRefresh }: QuizListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Quiz | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(quizId: string) {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      await supabase.from("quizzes").delete().eq("id", quizId);
      onRefresh();
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  if (quizzes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <FileText className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground text-center">
          No quizzes yet. Create your first one!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Your Quizzes</h2>
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => onSelect(quiz.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect(quiz.id);
            }}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {quiz.title}
                </span>
                <Badge
                  className={`border-0 text-xs capitalize ${getQuizStatusBadgeClass(
                    quiz.status
                  )}`}
                >
                  {quiz.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono tracking-wider">{quiz.code}</span>
                <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(quiz.code);
                  setCopiedId(quiz.id);
                  setTimeout(() => setCopiedId(null), 2000);
                }}
                title="Copy code"
              >
                {copiedId === quiz.id ? (
                  <span className="text-xs text-primary">Copied!</span>
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">Copy quiz code</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(quiz);
                }}
                className="text-destructive hover:text-destructive"
                title="Delete quiz"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete quiz</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <DeleteQuizDialog
        open={!!deleteTarget}
        quizTitle={deleteTarget?.title ?? ""}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        isDeleting={isDeleting}
      />
    </>
  );
}
