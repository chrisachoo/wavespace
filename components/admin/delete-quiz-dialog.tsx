"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";

interface DeleteQuizDialogProps {
  open: boolean;
  quizTitle: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteQuizDialog({
  open,
  quizTitle,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteQuizDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const matches = confirmText.trim() === quizTitle;

  useEffect(() => {
    if (open) {
      setConfirmText("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, quizTitle]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    if (open) {
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }
  }, [open, onOpenChange]);

  function handleConfirm() {
    if (!matches) return;
    onConfirm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete quiz</DialogTitle>
          <DialogDescription>
            This will permanently delete this quiz and all its questions,
            participants, and answers. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="delete-confirm">
              To confirm, type{" "}
              <span className="font-mono font-semibold text-foreground">
                {quizTitle}
              </span>
            </Label>
            <Input
              id="delete-confirm"
              ref={inputRef}
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={quizTitle}
              className="font-mono"
              disabled={isDeleting}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (matches) handleConfirm();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!matches || isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
