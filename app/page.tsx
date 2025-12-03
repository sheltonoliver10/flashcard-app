"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { FlashcardModeSelector } from "./components/FlashcardModeSelector";
import { FlashcardManagement } from "./components/FlashcardManagement";
import { Auth } from "./components/Auth";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const [mode, setMode] = useState<"study" | "manage">("study");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user is admin
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";
  const isAdmin = user?.email?.toLowerCase() === adminEmail.toLowerCase();

  useEffect(() => {
    try {
      const supabase = createSupabaseBrowserClient();

      // Check current session
      supabase.auth.getSession().then(({ data: { session }, error }) => {
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
        // Handle sign out events
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
        } else if (session?.user) {
          setUser(session.user);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error("Failed to initialize Supabase:", error);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      
      // Sign out from Supabase
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error("Sign out error:", signOutError);
      }
      
      // Also call the server-side logout route to ensure cookies are cleared
      try {
        await fetch("/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (serverError) {
        console.error("Server logout error:", serverError);
      }
      
      // Clear any local storage/session storage
      if (typeof window !== "undefined") {
        // Only clear Supabase-related items, not everything
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
      }
      
      // Clear user state immediately
      setUser(null);
      
      // Force a hard reload to ensure clean state
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch (error) {
      console.error("Failed to logout:", error);
      // Clear user state and redirect even on error
      setUser(null);
      window.location.href = "/";
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
            <h1 className="text-3xl font-bold">
              {mode === "study" ? "Bar Exam Flash Card Study" : "Flashcard Management"}
            </h1>
            <p className="text-sm text-gray-600 mt-1">Signed in as {user.email}</p>
          </div>
          <div className="flex gap-2 items-center">
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
            {isAdmin && (
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
          <FlashcardModeSelector />
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
