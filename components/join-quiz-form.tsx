"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Zap } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

export function JoinQuizForm() {
  const searchParams = useSearchParams();
  const initialCode = (searchParams.get("code") ?? "").toUpperCase();

  const [code, setCode] = useState(initialCode);
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleJoin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!code.trim() || !nickname.trim()) {
      setError("Please enter both a quiz code and your nickname.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

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

      const { data: result, error: rpcError } = await supabase.rpc(
        "join_quiz",
        {
          p_quiz_id: quiz.id,
          p_nickname: nickname.trim(),
        }
      );

      if (rpcError) {
        setError("Could not join the quiz. Please try again.");
        setLoading(false);
        return;
      }

      const res = result as {
        ok: boolean;
        error?: string;
        participant_id?: string;
      };
      if (!res.ok) {
        if (res.error === "quiz_full") {
          setError("Quiz is full (max 70 players). Try again later.");
        } else if (res.error === "quiz_not_started") {
          setError("This quiz hasn't started yet. Wait for the host.");
        } else if (res.error === "quiz_ended") {
          setError("This quiz has already ended.");
        } else if (res.error === "nickname_required") {
          setError("Please enter a nickname.");
        } else {
          setError("Could not join the quiz. Please try again.");
        }
        setLoading(false);
        return;
      }

      if (res.participant_id) {
        router.push(`/play/${quiz.id}?participantId=${res.participant_id}`);
      } else {
        setError("Could not join the quiz. Please try again.");
        setLoading(false);
      }
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
          className="h-14 text-center text-xl font-mono tracking-[0.3em] uppercase bg-background"
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
