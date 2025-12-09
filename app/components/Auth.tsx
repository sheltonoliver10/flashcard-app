"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Check if environment variables are set
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error("Supabase configuration is missing. Please check your environment variables.");
      }

      const supabase = createSupabaseBrowserClient();

      if (isResetPassword) {
        // Send password reset email
        const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL;
        
        if (!redirectUrl) {
          throw new Error("Password reset redirect URL is not configured. Please set NEXT_PUBLIC_REDIRECT_URL environment variable.");
        }
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });

        if (error) throw error;
        setMessage({
          type: "success",
          text: "Password reset email sent! Please check your email for the reset link.",
        });
        setEmail("");
        setIsResetPassword(false);
      } else if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;
        setMessage({
          type: "success",
          text: "Sign up successful! Please check your email to verify your account.",
        });
        setEmail("");
        setPassword("");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("Sign in error details:", {
            message: error.message,
            status: error.status,
            name: error.name,
          });
          throw error;
        }
        
        if (data?.session) {
          // Success - the page will automatically reload and show the app
          window.location.reload();
        } else {
          throw new Error("Sign in successful but no session was created. Please try again.");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setMessage({
        type: "error",
        text: error.message || error.toString() || "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">Bar Exam Notecards Study</h1>
        <p className="text-gray-600 text-center mb-6">
          {isResetPassword
            ? "Enter your email to reset your password"
            : isSignUp
            ? "Create an account to get started"
            : "Sign in to continue"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              placeholder="your@email.com"
            />
          </div>

          {!isResetPassword && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
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
              {isSignUp && (
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
              )}
            </div>
          )}

          {message && (
            <div
              className={`p-3 rounded-md ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading
              ? "Loading..."
              : isResetPassword
              ? "Send Reset Link"
              : isSignUp
              ? "Sign Up"
              : "Sign In"}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center">
          {!isResetPassword && (
            <button
              type="button"
              onClick={() => {
                setIsResetPassword(true);
                setMessage(null);
                setPassword("");
              }}
              className="block w-full text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Forgot your password?
            </button>
          )}
          {isResetPassword && (
            <button
              type="button"
              onClick={() => {
                setIsResetPassword(false);
                setMessage(null);
                setEmail("");
              }}
              className="block w-full text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Back to sign in
            </button>
          )}
          {!isResetPassword && (
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage(null);
                setEmail("");
                setPassword("");
              }}
              className="block w-full text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

