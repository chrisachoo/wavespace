"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Quiz } from "@/lib/types";
import { Copy, FileText, Trash2 } from "lucide-react";
import { useState } from "react";

interface QuizListProps {
  quizzes: Quiz[];
  onSelect: (quizId: string) => void;
  onRefresh: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  lobby: "bg-[oklch(0.6_0.18_250)]/15 text-[oklch(0.6_0.18_250)]",
  active: "bg-[oklch(0.65_0.19_145)]/15 text-[oklch(0.55_0.21_145)]",
  question: "bg-[oklch(0.65_0.19_145)]/15 text-[oklch(0.55_0.21_145)]",
  results: "bg-[oklch(0.7_0.17_55)]/15 text-[oklch(0.6_0.19_55)]",
  leaderboard: "bg-[oklch(0.7_0.17_55)]/15 text-[oklch(0.6_0.19_55)]",
  finished: "bg-muted text-muted-foreground",
};

export function QuizList({ quizzes, onSelect, onRefresh }: QuizListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleDelete(quizId: string) {
    const supabase = createClient();
    await supabase.from("quizzes").delete().eq("id", quizId);
    onRefresh();
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
              <span className="font-medium text-foreground">{quiz.title}</span>
              <Badge
                className={`border-0 text-xs ${
                  STATUS_COLORS[quiz.status] || ""
                }`}
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
                handleDelete(quiz.id);
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
  );
}
