import type { Participant, Question } from "@/lib/types";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuestionResultContentProps {
  didNotAnswer: boolean;
  isCorrect: boolean;
  options: readonly string[];
  correctOption: number;
}

function QuestionResultContent({
  didNotAnswer,
  isCorrect,
  options,
  correctOption,
}: Readonly<QuestionResultContentProps>) {
  if (didNotAnswer) {
    return (
      <div className="flex flex-col items-center gap-2">
        <XCircle className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold text-foreground">No Answer</h2>
        <p className="text-muted-foreground text-center">
          You didn't answer in time.
        </p>
      </div>
    );
  }
  if (isCorrect) {
    return (
      <div className="flex flex-col items-center gap-2">
        <CheckCircle2 className="h-16 w-16 text-[oklch(0.65_0.19_145)]" />
        <h2 className="text-2xl font-bold text-foreground">Correct!</h2>
        <p className="text-muted-foreground text-center">+10 points</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <XCircle className="h-16 w-16 text-destructive" />
      <h2 className="text-2xl font-bold text-foreground">Wrong</h2>
      <p className="text-muted-foreground text-center">
        The correct answer was:{" "}
        <span className="font-semibold text-foreground">
          {options[correctOption]}
        </span>
      </p>
    </div>
  );
}

interface ResultsScreenProps {
  question: Question | null;
  selectedOption: number | null;
  participant: Participant | null;
}

export function ResultsScreen({
  question,
  selectedOption,
  participant,
}: Readonly<ResultsScreenProps>) {
  if (!question) return null;

  const isCorrect = selectedOption === question.correct_option;
  const didNotAnswer = selectedOption === null;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-8">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <QuestionResultContent
          didNotAnswer={didNotAnswer}
          isCorrect={isCorrect}
          options={question.options}
          correctOption={question.correct_option}
        />

        {participant && (
          <div className="rounded-xl border border-border bg-card px-6 py-4 text-center">
            <p className="text-sm text-muted-foreground">Your Score</p>
            <p className="text-3xl font-bold text-foreground tabular-nums">
              {participant.score}
            </p>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Waiting for next question...
        </p>
      </div>
    </main>
  );
}
