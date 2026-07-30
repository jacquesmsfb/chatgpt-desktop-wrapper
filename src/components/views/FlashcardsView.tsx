import { useState } from "react";
import { useFlashcardsStore } from "@/stores/flashcards";
import { nanoid } from "nanoid";

export function FlashcardsView() {
  const flashcards = useFlashcardsStore((s) => s.flashcards);
  const createFlashcard = useFlashcardsStore((s) => s.createFlashcard);
  const deleteFlashcard = useFlashcardsStore((s) => s.deleteFlashcard);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleCreate = async () => {
    if (!question.trim() || !answer.trim()) return;
    await createFlashcard({
      id: nanoid(),
      conversationId: "",
      question: question.trim(),
      answer: answer.trim(),
      confidence: 0,
      nextReview: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    setQuestion("");
    setAnswer("");
    setShowForm(false);
  };

  return (
    <div className="flex h-full flex-col p-4 gap-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">Flashcards</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover transition-colors"
        >
          {showForm ? "Cancel" : "New Card"}
        </button>
      </div>

      {showForm && (
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
        >
          <input
            type="text"
            placeholder="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-accent transition-colors"
          />
          <textarea
            placeholder="Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-accent transition-colors resize-none"
          />
          <button
            onClick={handleCreate}
            disabled={!question.trim() || !answer.trim()}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
          >
            Create Flashcard
          </button>
        </div>
      )}

      {flashcards.length === 0 && !showForm && (
        <div className="flex-1 flex items-center justify-center text-xs text-text-muted">
          No flashcards yet
        </div>
      )}

      <div className="space-y-2">
        {flashcards.map((fc) => (
          <div
            key={fc.id}
            className="rounded-xl p-3 space-y-2"
            style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-text-primary">{fc.question}</p>
              <button
                onClick={() => deleteFlashcard(fc.id)}
                className="flex-shrink-0 rounded p-1 text-text-muted hover:text-error transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-text-secondary">{fc.answer}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-text-muted">
                Confidence: {fc.confidence}/5
              </span>
              {new Date(fc.nextReview) <= new Date() && (
                <span className="text-[10px] text-accent font-medium">Due for review</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
