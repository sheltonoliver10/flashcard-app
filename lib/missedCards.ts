// Utility functions to track missed flashcards in localStorage

const STORAGE_KEY = "flashcard_missed_cards";

export function getMissedCards(): Set<string> {
  if (typeof window === "undefined") return new Set();
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const missedArray = JSON.parse(stored) as string[];
      return new Set(missedArray);
    }
  } catch (error) {
    console.error("Error reading missed cards:", error);
  }
  
  return new Set();
}

export function addMissedCard(cardId: string) {
  if (typeof window === "undefined") return;
  
  try {
    const missedCards = getMissedCards();
    missedCards.add(cardId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(missedCards)));
  } catch (error) {
    console.error("Error saving missed card:", error);
  }
}

export function removeMissedCard(cardId: string) {
  if (typeof window === "undefined") return;
  
  try {
    const missedCards = getMissedCards();
    missedCards.delete(cardId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(missedCards)));
  } catch (error) {
    console.error("Error removing missed card:", error);
  }
}

export function clearMissedCards() {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing missed cards:", error);
  }
}

export function getMissedCardsForSubject(subjectId: string, allCards: Array<{ id: string; subject_id: string }>): string[] {
  const missedCards = getMissedCards();
  return allCards
    .filter(card => card.subject_id === subjectId && missedCards.has(card.id))
    .map(card => card.id);
}

