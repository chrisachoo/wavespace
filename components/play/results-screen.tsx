import type { Question, Participant } from "@/lib/types";
import { CheckCircle2, XCircle } from "lucide-react";

interface ResultsScreenProps {
  question: Question | null;
  selectedOption: number | null;
  participant: Participant | null;
}

export function ResultsScreen({
  question,
  selectedOption,
  participant,
}: ResultsScreenProps) {
  if (!question) return null;

  const isCorrect = selectedOption === question.correct_option;
  const didNotAnswer = selectedOption === null;
  const options = question.options as string[];

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-8">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        {/* Result indicator */}
        {didNotAnswer ? (
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-foreground">No Answer</h2>
            <p className="text-muted-foreground text-center">
              You didn't answer in time.
            </p>
          </div>
        ) : isCorrect ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="h-16 w-16 text-[oklch(0.65_0.19_145)]" />
            <h2 className="text-2xl font-bold text-foreground">Correct!</h2>
            <p className="text-muted-foreground text-center">+10 points</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-16 w-16 text-destructive" />
            <h2 className="text-2xl font-bold text-foreground">Wrong</h2>
            <p className="text-muted-foreground text-center">
              The correct answer was:{" "}
              <span className="font-semibold text-foreground">
                {options[question.correct_option]}
              </span>
            </p>
          </div>
        )}

        {/* Score */}
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
