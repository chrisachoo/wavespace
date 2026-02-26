import { buttonVariants } from "@/components/ui/button";
import { getRankedParticipants } from "@/lib/ranked-participants";
import type { Participant } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Home, Trophy } from "lucide-react";
import Link from "next/link";

interface FinishedScreenProps {
  participants: Participant[];
  currentParticipantId: string;
}

function getRankBadgeClass(rank: number): string {
  switch (rank) {
    case 1:
      return "bg-[oklch(0.7_0.17_55)] text-white";
    case 2:
      return "bg-muted text-muted-foreground";
    case 3:
      return "bg-[oklch(0.7_0.12_55)] text-white";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

export function FinishedScreen({
  participants,
  currentParticipantId,
}: Readonly<FinishedScreenProps>) {
  const ranked = getRankedParticipants(participants);
  const myEntry = ranked.find((r) => r.participant.id === currentParticipantId);
  const me = myEntry?.participant;
  const myRank = myEntry?.rank;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-8">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <Trophy className="h-12 w-12 text-[oklch(0.7_0.17_55)]" />
          <h2 className="text-2xl font-bold text-foreground">Quiz Complete!</h2>
        </div>

        {me && myRank !== undefined && (
          <div className="w-full rounded-xl border-2 border-primary bg-primary/5 p-6 text-center">
            <p className="text-sm text-muted-foreground">Your Final Result</p>
            <p className="text-4xl font-bold text-foreground mt-1 tabular-nums">
              {me.score} pts
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Rank #{myRank} of {ranked.length}
            </p>
          </div>
        )}

        <div className="w-full flex flex-col gap-2">
          {ranked.slice(0, 5).map(({ participant: p, rank }) => {
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
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${getRankBadgeClass(
                      rank
                    )}`}
                  >
                    {rank}
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

        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </main>
  );
}
