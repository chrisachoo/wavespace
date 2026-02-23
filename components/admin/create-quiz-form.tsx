"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, GripVertical } from "lucide-react";

interface QuestionInput {
  question_text: string;
  options: string[];
  correct_option: number;
  time_limit: number;
}

interface CreateQuizFormProps {
  onCreated: (quizId: string) => void;
  onCancel: () => void;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function CreateQuizForm({ onCreated, onCancel }: CreateQuizFormProps) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { question_text: "", options: ["", "", "", ""], correct_option: 0, time_limit: 20 },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      { question_text: "", options: ["", "", "", ""], correct_option: 0, time_limit: 20 },
    ]);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, field: keyof QuestionInput, value: unknown) {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    setQuestions((prev) => {
      const updated = [...prev];
      const newOptions = [...updated[qIndex].options];
      newOptions[oIndex] = value;
      updated[qIndex] = { ...updated[qIndex], options: newOptions };
      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a quiz title.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        setError(`Question ${i + 1} needs text.`);
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        setError(`All options in question ${i + 1} must be filled.`);
        return;
      }
    }

    setSaving(true);

    try {
      const supabase = createClient();
      const code = generateCode();

      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({ title: title.trim(), code })
        .select("id")
        .single();

      if (quizError || !quiz) {
        setError("Failed to create quiz.");
        setSaving(false);
        return;
      }

      const questionRows = questions.map((q, i) => ({
        quiz_id: quiz.id,
        question_text: q.question_text.trim(),
        options: q.options.map((o) => o.trim()),
        correct_option: q.correct_option,
        time_limit: q.time_limit,
        sort_order: i,
      }));

      const { error: questionsError } = await supabase
        .from("questions")
        .insert(questionRows);

      if (questionsError) {
        setError("Quiz created but failed to add questions.");
        setSaving(false);
        return;
      }

      onCreated(quiz.id);
    } catch {
      setError("Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Create New Quiz</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add a title and questions. You can start the quiz after creating it.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Quiz Title</Label>
        <Input
          id="title"
          placeholder="e.g. Science Trivia Round 1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-card"
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Questions</h3>
          <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>

        {questions.map((q, qIndex) => (
          <Card key={qIndex} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">
                    Question {qIndex + 1}
                  </CardTitle>
                </div>
                {questions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove question</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                placeholder="Enter your question"
                value={q.question_text}
                onChange={(e) =>
                  updateQuestion(qIndex, "question_text", e.target.value)
                }
                className="bg-background"
              />

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuestion(qIndex, "correct_option", oIndex)
                      }
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        q.correct_option === oIndex
                          ? "bg-[oklch(0.65_0.19_145)] text-white"
                          : "bg-secondary text-secondary-foreground hover:bg-muted"
                      }`}
                      title={
                        q.correct_option === oIndex
                          ? "Correct answer"
                          : "Click to mark as correct"
                      }
                    >
                      {String.fromCharCode(65 + oIndex)}
                    </button>
                    <Input
                      placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                      value={opt}
                      onChange={(e) =>
                        updateOption(qIndex, oIndex, e.target.value)
                      }
                      className="bg-background"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Label
                  htmlFor={`time-${qIndex}`}
                  className="text-sm text-muted-foreground whitespace-nowrap"
                >
                  Time limit
                </Label>
                <Input
                  id={`time-${qIndex}`}
                  type="number"
                  min={5}
                  max={120}
                  value={q.time_limit}
                  onChange={(e) =>
                    updateQuestion(
                      qIndex,
                      "time_limit",
                      parseInt(e.target.value) || 20
                    )
                  }
                  className="w-20 bg-background"
                />
                <span className="text-sm text-muted-foreground">seconds</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create Quiz"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
