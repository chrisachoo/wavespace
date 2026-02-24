"use client";

import type { Question } from "@/lib/types";
import { CheckCircle2, Timer } from "lucide-react";
import { useEffect, useState } from "react";

interface QuestionScreenProps {
  question: Question | null;
  questionIndex: number;
  totalQuestions: number;
  hasAnswered: boolean;
  selectedOption: number | null;
  onAnswer: (optionIndex: number) => void;
}

const OPTION_COLORS = [
  "bg-[oklch(0.65_0.2_25)] hover:bg-[oklch(0.6_0.22_25)] text-white", // Red/coral
  "bg-[oklch(0.6_0.18_250)] hover:bg-[oklch(0.55_0.2_250)] text-white", // Blue
  "bg-[oklch(0.65_0.19_145)] hover:bg-[oklch(0.6_0.21_145)] text-white", // Green
  "bg-[oklch(0.7_0.17_55)] hover:bg-[oklch(0.65_0.19_55)] text-white", // Amber/yellow
];

const OPTION_SELECTED_COLORS = [
  "bg-[oklch(0.55_0.22_25)] text-white ring-4 ring-[oklch(0.65_0.2_25)]/30",
  "bg-[oklch(0.5_0.2_250)] text-white ring-4 ring-[oklch(0.6_0.18_250)]/30",
  "bg-[oklch(0.55_0.21_145)] text-white ring-4 ring-[oklch(0.65_0.19_145)]/30",
  "bg-[oklch(0.6_0.19_55)] text-white ring-4 ring-[oklch(0.7_0.17_55)]/30",
];

export function QuestionScreen({
  question,
  questionIndex,
  totalQuestions,
  hasAnswered,
  selectedOption,
  onAnswer,
}: Readonly<QuestionScreenProps>) {
  const [timeLeft, setTimeLeft] = useState(question?.time_limit ?? 40);

  useEffect(() => {
    setTimeLeft(question?.time_limit ?? 40);
  }, [question]);

  useEffect(() => {
    if (hasAnswered || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [hasAnswered, timeLeft]);

  if (!question) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-muted-foreground">Waiting for question...</p>
      </main>
    );
  }

  const options = question.options;

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <span className="text-sm font-medium text-muted-foreground">
          {questionIndex + 1} / {totalQuestions}
        </span>
        <div className="flex items-center gap-1.5">
          <Timer className="h-4 w-4 text-muted-foreground" />
          <span
            className={`text-sm font-bold tabular-nums ${
              timeLeft <= 5 ? "text-destructive" : "text-foreground"
            }`}
          >
            {timeLeft}s
          </span>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-8">
        <h2 className="text-xl font-bold text-foreground text-balance text-center leading-relaxed max-w-2xl">
          {question.question_text}
        </h2>

        <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((option, index) => {
            const isSelected = selectedOption === index;
            const colorClass = isSelected
              ? OPTION_SELECTED_COLORS[index % 4]
              : OPTION_COLORS[index % 4];

            return (
              <button
                key={index}
                onClick={() => onAnswer(index)}
                disabled={hasAnswered || timeLeft <= 0}
                className={`flex items-center gap-3 rounded-xl px-5 py-4 text-left text-base font-medium transition-all disabled:opacity-70 ${colorClass}`}
              >
                {isSelected && <CheckCircle2 className="h-5 w-5 shrink-0" />}
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        {hasAnswered && (
          <p className="text-sm text-muted-foreground">
            Answer submitted! Waiting for results...
          </p>
        )}

        {!hasAnswered && timeLeft <= 0 && (
          <p className="text-sm text-destructive font-medium">{"Time's up!"}</p>
        )}
      </div>
    </main>
  );
}
