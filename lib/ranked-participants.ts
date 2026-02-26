import type { Participant } from "@/lib/types";

export interface RankedParticipant {
  participant: Participant;
  rank: number;
}

/**
 * Sorts participants by score descending and assigns ordinal ranks.
 * Tied scores get the same rank; the next lower score skips to the next ordinal
 * (e.g. two 1st, then 3rd).
 * Returns the full ranked list (use .slice(0, 5) for Top 5 or filter by rank <= 3 for podium).
 */
export function getRankedParticipants(
  participants: Participant[]
): RankedParticipant[] {
  const sorted = [...participants].sort((a, b) => b.score - a.score);
  const result: RankedParticipant[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const participant = sorted[i];
    const rank =
      i === 0 ? 1 : sorted[i].score === sorted[i - 1].score ? result[i - 1].rank : i + 1;
    result.push({ participant, rank });
  }
  return result;
}
