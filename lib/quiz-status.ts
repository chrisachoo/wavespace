export const QUIZ_STATUS_BADGE_CLASS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  lobby: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  question: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  results: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  leaderboard: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  finished: "bg-muted text-muted-foreground",
};

export function getQuizStatusBadgeClass(status: string): string {
  return QUIZ_STATUS_BADGE_CLASS[status] ?? "bg-muted text-muted-foreground";
}
