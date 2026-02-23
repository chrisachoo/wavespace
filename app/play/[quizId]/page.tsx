import { PlayClient } from "@/components/play/play-client";
import { redirect } from "next/navigation";

export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ quizId: string }>;
  searchParams: Promise<{ participantId?: string }>;
}) {
  const { quizId } = await params;
  const { participantId } = await searchParams;

  if (!participantId) {
    redirect("/");
  }

  return <PlayClient quizId={quizId} participantId={participantId} />;
}
