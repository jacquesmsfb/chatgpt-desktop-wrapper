import { useState, useMemo } from "react";
import { useFlashcardsStore } from "@/stores/flashcards";

export function QuizView() {
  const flashcards = useFlashcardsStore((s) => s.flashcards);
  const updateFlashcard = useFlashcardsStore((s) => s.updateFlashcard);

  const queue = useMemo(() => {
    const due = flashcards.filter(
      (fc) => new Date(fc.nextReview) <= new Date() || fc.confidence < 3,
    );
    return due.length > 0 ? shuffle(due) : shuffle([...flashcards]);
  }, [flashcards]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const current = queue[currentIndex] ?? null;

  const handleRate = async (confidence: number) => {
    if (!current) return;
    const now = new Date();
    const interval = getInterval(confidence);
    now.setDate(now.getDate() + interval);
    await updateFlashcard({
      ...current,
      confidence,
      nextReview: now.toISOString(),
    });
    setShowAnswer(false);
    setCurrentIndex((i) => i + 1);
  };

  if (flashcards.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted text-sm">
        No flashcards yet. Create some from your conversations.
      </div>
    );
  }

  if (!current || currentIndex >= queue.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-sm text-text-primary font-medium">Quiz Complete!</p>
        <p className="text-xs text-text-muted">
          Reviewed {queue.length} cards
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setShowAnswer(false);
          }}
          className="rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent-hover transition-colors"
        >
          Review Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 gap-6">
      <p className="text-xs text-text-muted">
        Card {currentIndex + 1} of {queue.length}
      </p>

      <div
        className="w-full max-w-lg rounded-xl p-6 cursor-pointer select-none transition-all"
        style={{
          border: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          minHeight: 200,
        }}
        onClick={() => setShowAnswer(true)}
      >
        {!showAnswer ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <p className="text-xs text-text-muted uppercase tracking-wider">Question</p>
            <p className="text-sm text-text-primary text-center leading-relaxed">
              {current.question}
            </p>
            <p className="text-[10px] text-text-muted mt-2">Click to reveal answer</p>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <p className="text-xs text-text-muted uppercase tracking-wider">Answer</p>
            <p className="text-sm text-text-primary text-center leading-relaxed">
              {current.answer}
            </p>
          </div>
        )}
      </div>

      {showAnswer && (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRate(rating)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                border: "1px solid var(--color-border)",
                color: rating <= 2 ? "var(--color-error)" : rating >= 4 ? "var(--color-success)" : "var(--color-text-primary)",
              }}
            >
              {rating === 1 && "Again"}
              {rating === 2 && "Hard"}
              {rating === 3 && "Good"}
              {rating === 4 && "Easy"}
              {rating === 5 && "Perfect"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getInterval(confidence: number): number {
  switch (confidence) {
    case 1: return 0;
    case 2: return 1;
    case 3: return 3;
    case 4: return 7;
    case 5: return 14;
    default: return 1;
  }
}

function shuffle<T>(array: readonly T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i] as T;
    copy[i] = copy[j] as T;
    copy[j] = temp;
  }
  return copy;
}
