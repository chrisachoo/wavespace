import { JoinQuizForm } from "@/components/join-quiz-form";
import { Radio } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Radio className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance text-center font-sans">
            Wavespace
          </h1>
          <p className="text-muted-foreground text-center text-pretty text-base leading-relaxed">
            Join a live quiz and compete in real time.
          </p>
        </div>

        <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm">
          <JoinQuizForm />
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Ask your host for the quiz code to get started.
        </p>
        <Link
          href="/admin-wavespace"
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        >
          Host a quiz?
        </Link>
      </div>
    </main>
  );
}
