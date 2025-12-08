"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    const checkResetToken = async () => {
      const supabase = createSupabaseBrowserClient();
      
      // Check if we have a reset token in the URL hash (Supabase redirects with hash)
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      
      console.log("URL hash:", hash ? hash.substring(0, 50) + "..." : "no hash");
      console.log("URL search:", window.location.search);
      
      // Check hash first (Supabase's preferred method)
      const hashParams = new URLSearchParams(hash.substring(1));
      let accessToken = hashParams.get("access_token");
      let type = hashParams.get("type");
      
      // If not in hash, check query params (fallback)
      if (!accessToken) {
        accessToken = searchParams.get("access_token");
        type = searchParams.get("type");
      }

      console.log("Token check:", { accessToken: !!accessToken, type });

      const hasTokenInUrl = accessToken && type === "recovery";
      
      if (hasTokenInUrl) {
        console.log("Reset token found in URL hash, processing...");
        
        // Supabase SSR should automatically process the hash token when getSession() is called
        // Listen for auth state changes to detect when token is processed
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log("Auth state changed on reset page:", event, session?.user?.email || "no user");
          
          if (event === 'PASSWORD_RECOVERY' || (session && session.user)) {
            console.log("Password recovery token processed successfully");
            setIsValidToken(true);
            subscription.unsubscribe();
          }
        });

        // Check session multiple times with increasing delays
        const checkSession = async (attempt: number) => {
          const { data: { session }, error } = await supabase.auth.getSession();
          console.log(`Session check attempt ${attempt}:`, session?.user?.email || "no session", error?.message || "no error");
          
          if (session && session.user && !error) {
            console.log("Session found, token is valid");
            setIsValidToken(true);
            subscription.unsubscribe();
            return true;
          }
          return false;
        };

        // Check immediately
        const immediateCheck = await checkSession(1);
        
        if (!immediateCheck) {
          // Check after 1 second
          setTimeout(async () => {
            const delayedCheck = await checkSession(2);
            if (!delayedCheck) {
              // Check after 3 more seconds
              setTimeout(async () => {
                const finalCheck = await checkSession(3);
                if (!finalCheck) {
                  console.log("Token processing failed after all attempts");
                  setMessage({
                    type: "error",
                    text: "Invalid or expired reset link. Please request a new password reset.",
                  });
                }
                subscription.unsubscribe();
              }, 3000);
            } else {
              subscription.unsubscribe();
            }
          }, 1000);
        } else {
          subscription.unsubscribe();
        }
      } else {
        // No token in URL - check if there's already a valid session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsValidToken(true);
        } else {
          // Show error immediately if no token found
          setMessage({
            type: "error",
            text: "Invalid or expired reset link. Please request a new password reset.",
          });
          setIsValidToken(false);
        }
      }
    };

    checkResetToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Passwords do not match.",
      });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Password updated successfully! Redirecting to sign in...",
      });

      // Redirect to home page after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">Reset Password</h1>
        <p className="text-gray-900 text-center mb-6">
          Enter your new password below
        </p>

        {message && (
          <div
            className={`mb-4 p-3 rounded-md ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {isValidToken ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Go to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

