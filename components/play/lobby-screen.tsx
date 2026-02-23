import type { Quiz, Participant } from "@/lib/types";
import { Radio, Users } from "lucide-react";

interface LobbyScreenProps {
  quiz: Quiz;
  participants: Participant[];
  nickname: string;
}

export function LobbyScreen({
  quiz,
  participants,
  nickname,
}: Readonly<LobbyScreenProps>) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-8">
      <div className="flex w-full max-w-lg flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Radio className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground text-balance text-center">
            {quiz.title}
          </h1>
          <p className="text-muted-foreground text-center">
            {"You're in! Waiting for the host to start..."}
          </p>
        </div>

        <div className="w-full rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">
                {participants.length}{" "}
                {participants.length === 1 ? "player" : "players"}
              </span>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {quiz.code}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {participants.map((p) => (
              <span
                key={p.id}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  p.nickname === nickname
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {p.nickname}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">
            Waiting for host...
          </span>
        </div>
      </div>
    </main>
  );
}
