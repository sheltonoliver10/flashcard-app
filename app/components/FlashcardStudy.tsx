"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  subject_id: string;
  subtopic_id: string;
}

interface FlashcardStudyProps {
  studyMode: "subject" | "subtopic" | "random";
  subjectId?: string;
  subtopicId?: string;
  onBack?: () => void;
}

export function FlashcardStudy({ studyMode, subjectId, subtopicId, onBack }: FlashcardStudyProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCards, setCorrectCards] = useState<Set<string>>(new Set());
  const [wrongCards, setWrongCards] = useState<Set<string>>(new Set());
  const [originalWrongCards, setOriginalWrongCards] = useState<Set<string>>(new Set());
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Fetch flashcards based on study mode
  useEffect(() => {
    const fetchFlashcards = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createSupabaseBrowserClient();
        let query = supabase.from("flashcards").select("*");

        if (studyMode === "subject" && subjectId) {
          query = query.eq("subject_id", subjectId);
        } else if (studyMode === "subtopic" && subtopicId) {
          query = query.eq("subtopic_id", subtopicId);
        }
        // For random mode, we'll fetch all and shuffle

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        let cards = data || [];
        
        // For random mode, shuffle and take 25
        if (studyMode === "random") {
          cards = shuffleArray(cards).slice(0, 25);
        }

        if (cards.length === 0) {
          setError("No flashcards found for this selection.");
          setLoading(false);
          return;
        }

        setFlashcards(cards);
        setSessionCards(cards);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load flashcards");
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [studyMode, subjectId, subtopicId]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleStart = () => {
    setSessionStarted(true);
    setIsReviewMode(false);
    setOriginalWrongCards(new Set());
  };

  const handleCorrect = () => {
    const currentCard = sessionCards[currentIndex];
    if (!currentCard) return;

    setCorrectCards((prev) => new Set(prev).add(currentCard.id));
    
    // Remove from wrong cards if it was there
    setWrongCards((prev) => {
      const newSet = new Set(prev);
      newSet.delete(currentCard.id);
      return newSet;
    });

    moveToNext();
  };

  const handleWrong = () => {
    const currentCard = sessionCards[currentIndex];
    if (!currentCard) return;

    setWrongCards((prev) => new Set(prev).add(currentCard.id));
    moveToNext();
  };

  const moveToNext = () => {
    setIsFlipped(false);
    
    // Check if we've gone through all cards
    if (currentIndex >= sessionCards.length - 1) {
      // If this is the first pass (not review mode), save wrong cards and show completion screen
      if (!isReviewMode) {
        setOriginalWrongCards(new Set(wrongCards));
        setSessionComplete(true);
      } else {
        // In review mode, always show completion screen with current session results
        // Update originalWrongCards to reflect the current wrong cards from this review session
        setOriginalWrongCards(new Set(wrongCards));
        setSessionComplete(true);
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRestart = () => {
    setSessionStarted(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectCards(new Set());
    setWrongCards(new Set());
    setOriginalWrongCards(new Set());
    setIsReviewMode(false);
    setSessionCards(flashcards);
    setSessionComplete(false);
  };

  const handleReviewMissedCards = () => {
    const missedCardsArray = flashcards.filter((card) => originalWrongCards.has(card.id));
    setSessionCards(missedCardsArray);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectCards(new Set());
    setWrongCards(new Set());
    setIsReviewMode(true);
    setSessionComplete(false);
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-gray-600">Loading flashcards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        {onBack && (
          <div className="mb-4 text-left">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium flex items-center gap-2"
            >
              <span>←</span>
              <span>Return to Home</span>
            </button>
          </div>
        )}
        <p className="text-red-600 mb-4">{error}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Return to Home
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        {onBack && (
          <div className="mb-4 text-left">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium flex items-center gap-2"
            >
              <span>←</span>
              <span>Return to Home</span>
            </button>
          </div>
        )}
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Ready to Study Flashcards?</h2>
        <p className="text-gray-900 mb-6">
          You'll be studying {sessionCards.length} flashcard{sessionCards.length !== 1 ? "s" : ""}.
          <br />
          Mark cards as correct or incorrect. Cards you get wrong will be shown again.
        </p>
        <button
          onClick={handleStart}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-lg font-medium"
        >
          Start Flashcard Session
        </button>
      </div>
    );
  }

  if (sessionComplete) {
    // Calculate score based on current session
    // When in review mode, sessionCards contains the cards from the review session
    // When not in review mode, we need to use the original flashcards length
    const totalCardsInSession = isReviewMode ? sessionCards.length : flashcards.length;
    const correctInSession = totalCardsInSession - originalWrongCards.size;
    const perfectScore = originalWrongCards.size === 0;

    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        {onBack && (
          <div className="mb-4 text-left">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium flex items-center gap-2"
            >
              <span>←</span>
              <span>Return to Home</span>
            </button>
          </div>
        )}
        <h2 className="text-2xl font-semibold mb-4 text-purple-600">🎉 Session Complete!</h2>
        <p className="text-gray-700 mb-2 text-lg">
          You got {correctInSession} out of {totalCardsInSession} cards correct!
        </p>
        {perfectScore ? (
          <p className="text-green-600 mb-6 font-medium">Perfect score!</p>
        ) : (
          <p className="text-orange-600 mb-6 font-medium">Keep practicing!</p>
        )}
        <div className="flex flex-col gap-4 justify-center items-center">
          {!perfectScore && (
            <button
              onClick={handleReviewMissedCards}
              className="px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-lg font-medium w-full max-w-xs"
            >
              Review Missed Cards ({originalWrongCards.size})
            </button>
          )}
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-lg font-medium w-full max-w-xs"
          >
            Study Again
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-lg font-medium w-full max-w-xs"
            >
              Return to Home
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentCard = sessionCards[currentIndex];
  const progress = ((currentIndex + 1) / sessionCards.length) * 100;

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      {/* Return to Home button */}
      {onBack && (
        <div className="mb-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium flex items-center gap-2"
          >
            <span>←</span>
            <span>Return to Home</span>
          </button>
        </div>
      )}
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Card {currentIndex + 1} of {sessionCards.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      {currentCard && (
        <div className="mb-6">
          <div
            className="min-h-[200px] md:min-h-[300px] flex items-center justify-center p-4 md:p-8 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-all bg-white"
            onClick={handleFlip}
          >
            <div className="text-center w-full">
              <p className="text-sm text-gray-500 mb-2">
                {isFlipped ? "Back" : "Front"}
              </p>
              <p className="text-base md:text-xl font-medium text-gray-800 whitespace-pre-wrap break-words">
                {isFlipped ? currentCard.back_text : currentCard.front_text}
              </p>
              <p className="text-xs text-gray-400 mt-4">Click to flip</p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={handleWrong}
          className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
        >
          ❌ Got it Wrong
        </button>
        <button
          onClick={handleCorrect}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
        >
          ✅ Got it Right
        </button>
      </div>
    </div>
  );
}

