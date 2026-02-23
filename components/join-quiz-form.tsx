"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap } from "lucide-react";

export function JoinQuizForm() {
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!code.trim() || !nickname.trim()) {
      setError("Please enter both a quiz code and your nickname.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Look up quiz by code
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .select("id, status")
        .eq("code", code.trim().toUpperCase())
        .single();

      if (quizError || !quiz) {
        setError("Quiz not found. Check the code and try again.");
        setLoading(false);
        return;
      }

      if (quiz.status === "draft") {
        setError("This quiz hasn't started yet. Wait for the host.");
        setLoading(false);
        return;
      }

      if (quiz.status === "finished") {
        setError("This quiz has already ended.");
        setLoading(false);
        return;
      }

      // Register participant
      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .insert({
          quiz_id: quiz.id,
          nickname: nickname.trim(),
        })
        .select("id")
        .single();

      if (participantError || !participant) {
        setError("Could not join the quiz. Please try again.");
        setLoading(false);
        return;
      }

      // Navigate to the play page
      router.push(
        `/play/${quiz.id}?participantId=${participant.id}`
      );
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleJoin} className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2">
        <label htmlFor="code" className="text-sm font-medium text-foreground">
          Quiz Code
        </label>
        <Input
          id="code"
          type="text"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={6}
          className="h-14 text-center text-2xl font-mono tracking-[0.3em] uppercase bg-background"
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="nickname"
          className="text-sm font-medium text-foreground"
        >
          Your Nickname
        </label>
        <Input
          id="nickname"
          type="text"
          placeholder="Enter your nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
          className="h-12 bg-background"
          autoComplete="off"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive text-center" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={loading} className="mt-2">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            Joining...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Join Quiz
          </span>
        )}
      </Button>
    </form>
  );
}
