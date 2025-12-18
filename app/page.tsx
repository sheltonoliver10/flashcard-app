"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { FlashcardModeSelector } from "./components/FlashcardModeSelector";
import { FlashcardManagement } from "./components/FlashcardManagement";
import { Auth } from "./components/Auth";
import { PieChart } from "./components/PieChart";
import type { User } from "@supabase/supabase-js";

interface SubjectMastery {
  subject_id: string;
  subject_name: string;
  mastery_percentage: number;
  cards_mastered: number;
  total_cards: number;
}

export default function Home() {
  const [mode, setMode] = useState<"study" | "manage">("study");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [subjectMastery, setSubjectMastery] = useState<SubjectMastery[]>([]);
  
  // Check if user is admin
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";
  const isAdmin = user?.email?.toLowerCase() === adminEmail.toLowerCase();

  useEffect(() => {
    // Check for auth tokens in URL hash (password reset or email verification)
    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (type === 'recovery' && accessToken) {
        // Redirect to reset password page with token
        window.location.href = `/auth/reset-password${hash}`;
        return;
      }
      
      // Handle email verification - Supabase will automatically process it
      if (type === 'signup' && accessToken) {
        // Let Supabase process the verification token
        // The auth state change listener will handle the session
        return;
      }
    }

    // Check if we're in the middle of logging out (check sessionStorage flag)
    const wasLoggingOut = sessionStorage.getItem('_logout_in_progress') === 'true';
    if (wasLoggingOut) {
      sessionStorage.removeItem('_logout_in_progress');
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();

      // Check current session
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        // Don't restore session if we're logging out
        if (isLoggingOut) {
          console.log("Logging out, skipping session restore");
          setUser(null);
          setLoading(false);
          return;
        }

        if (error) {
          console.error("Session error:", error);
          // If there's an error, clear any invalid session
          supabase.auth.signOut();
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Validate session exists and has a user
        if (session?.user) {
          setUser(session.user);
        } else {
          // No valid session, ensure we're signed out
          setUser(null);
        }
        setLoading(false);
      }).catch((err) => {
        console.error("Failed to get session:", err);
        setUser(null);
        setLoading(false);
      });

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        // Don't restore session if we're in the process of logging out
        if (isLoggingOut) {
          console.log("Logging out, ignoring auth state change");
          return;
        }
        
        console.log("Auth state changed:", event, session?.user?.email || "no user");
        // Handle sign out events - be very explicit
        if (event === 'SIGNED_OUT') {
          console.log("SIGNED_OUT event detected, clearing user");
          setUser(null);
          setLoading(false);
          return;
        }
        if (!session || !session.user) {
          console.log("No session found, clearing user");
          setUser(null);
          setLoading(false);
          return;
        }
        if (session?.user) {
          console.log("Session found, setting user:", session.user.email);
          setUser(session.user);
          setLoading(false);
        } else {
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error("Failed to initialize Supabase:", error);
      setUser(null);
      setLoading(false);
    }
  }, []);

  // Fetch user's card mastery percentage for each subject
  useEffect(() => {
    const fetchSubjectMastery = async () => {
      if (!user) {
        setSubjectMastery([]);
        return;
      }

      try {
        const supabase = createSupabaseBrowserClient();
        
        // Get all subjects
        const { data: subjects, error: subjectsError } = await supabase
          .from('subjects')
          .select('id, name')
          .order('name');

        if (subjectsError) throw subjectsError;
        if (!subjects || subjects.length === 0) {
          setSubjectMastery([]);
          return;
        }

        // Calculate mastery for each subject
        const masteryPromises = subjects.map(async (subject) => {
          // Get total cards for this subject
          const { data: allCards, error: cardsError } = await supabase
            .from('flashcards')
            .select('id')
            .eq('subject_id', subject.id);

          if (cardsError) throw cardsError;
          const totalCards = allCards?.length || 0;

          if (totalCards === 0) {
            return {
              subject_id: subject.id,
              subject_name: subject.name,
              mastery_percentage: 0,
              cards_mastered: 0,
              total_cards: 0
            };
          }

          // Get user's mastery records for cards in this subject
          const { data: masteryRecords, error: masteryError } = await supabase
            .from('card_mastery')
            .select('card_id, correct_count')
            .eq('user_id', user.id)
            .in('card_id', allCards.map(c => c.id));

          if (masteryError) throw masteryError;

          // Count cards mastered (correct_count >= 5)
          const cardsMastered = (masteryRecords || []).filter(
            (record: any) => record.correct_count >= 5
          ).length;

          const masteryPercentage = totalCards > 0 
            ? (cardsMastered / totalCards) * 100 
            : 0;

          return {
            subject_id: subject.id,
            subject_name: subject.name,
            mastery_percentage: masteryPercentage,
            cards_mastered: cardsMastered,
            total_cards: totalCards
          };
        });

        const mastery = await Promise.all(masteryPromises);
        setSubjectMastery(mastery);
      } catch (error) {
        console.error('Error fetching subject mastery:', error);
        setSubjectMastery([]);
      }
    };

    fetchSubjectMastery();
  }, [user]);

  const handleLogout = async () => {
    console.log("Logout initiated");
    setIsLoggingOut(true); // Prevent auth state listener from restoring session
    setUser(null); // Clear user state immediately
    
    try {
      const supabase = createSupabaseBrowserClient();
      
      // Set a flag in sessionStorage to prevent session restore on reload
      if (typeof window !== "undefined") {
        sessionStorage.setItem('_logout_in_progress', 'true');
      }
      
      // Sign out from Supabase FIRST
      console.log("Calling supabase.auth.signOut()");
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error("Sign out error:", signOutError);
      } else {
        console.log("Sign out successful");
      }
      
      // Clear all storage AFTER signOut
      if (typeof window !== "undefined") {
        console.log("Clearing storage...");
        // Clear ALL localStorage (Supabase stores session here)
        localStorage.clear();
        // Keep the logout flag in sessionStorage temporarily
        sessionStorage.clear();
        sessionStorage.setItem('_logout_in_progress', 'true');
        console.log("Storage cleared");
      }
      
      // Wait a moment to ensure signOut completes and cookies are cleared
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log("Redirecting to home page...");
      // Force immediate hard redirect - use replace to prevent back button
      window.location.replace("/");
    } catch (error) {
      console.error("Failed to logout:", error);
      // Clear user state and redirect even on error
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.setItem('_logout_in_progress', 'true');
      }
      window.location.replace("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === "study" ? "Bar Exam Notecards Study" : "Flashcard Management"}
            </h1>
            {isAdmin && (
              <p className="text-sm text-gray-600 mt-1">Signed in as {user.email}</p>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {isAdmin && (
              <>
                <button
                  onClick={() => setMode("study")}
                  className={`px-4 py-2 rounded-md font-medium ${
                    mode === "study"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Study Mode
                </button>
                <button
                  onClick={() => setMode("manage")}
                  className={`px-4 py-2 rounded-md font-medium ${
                    mode === "manage"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Management Mode
                </button>
              </>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
        {mode === "study" ? (
          <>
            {subjectMastery.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Cards Mastered by Topic</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {subjectMastery.map((mastery) => (
                    <div
                      key={mastery.subject_id}
                      className="flex flex-col items-center p-3 border border-gray-200 rounded-md bg-gray-50"
                      style={{ width: '110px' }}
                    >
                      <h3 className="text-xs font-semibold text-gray-900 mb-1 text-center">{mastery.subject_name}</h3>
                      <div className="flex items-center justify-center h-14">
                        <PieChart percentage={mastery.mastery_percentage} size={55} />
                      </div>
                      <div className={`mt-1 text-xs font-bold ${
                        mastery.mastery_percentage >= 80
                          ? 'text-green-600'
                          : mastery.mastery_percentage >= 60
                          ? 'text-yellow-600'
                          : mastery.mastery_percentage > 0
                          ? 'text-orange-600'
                          : 'text-gray-500'
                      }`}>
                        {Math.round(mastery.mastery_percentage)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <FlashcardModeSelector />
          </>
        ) : isAdmin ? (
          <FlashcardManagement />
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-red-600 mb-4">Access Denied</p>
            <p className="text-gray-600 mb-4">You don't have permission to access Management Mode.</p>
            <button
              onClick={() => setMode("study")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Study Mode
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
