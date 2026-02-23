import type { Participant } from "@/lib/types";
import { Trophy } from "lucide-react";

interface LeaderboardScreenProps {
  participants: Participant[];
  currentParticipantId: string;
}

function setStyling(value: number) {
  if (value === 0) return "bg-teal text-white";
  if (value === 1) return "bg-muted text-muted-foreground";
  if (value === 2) return "bg-amber text-white";
  else return "bg-secondary text-secondary-foreground";
}

export function LeaderboardScreen({
  participants,
  currentParticipantId,
}: Readonly<LeaderboardScreenProps>) {
  const sorted = [...participants].sort((a, b) => b.score - a.score);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-8">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <Trophy className="h-10 w-10 text-[oklch(0.7_0.17_55)]" />
          <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
        </div>

        <div className="w-full flex flex-col gap-2">
          {sorted.map((p, index) => {
            const isMe = p.id === currentParticipantId;
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                  isMe
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-card border border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${setStyling(
                      index
                    )}`}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={`font-medium ${
                      isMe ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {p.nickname}
                    {isMe && (
                      <span className="text-xs ml-1 text-muted-foreground">
                        (you)
                      </span>
                    )}
                  </span>
                </div>
                <span className="font-bold text-foreground tabular-nums">
                  {p.score}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-sm text-muted-foreground">
          Next question coming up...
        </p>
      </div>
    </main>
  );
}
