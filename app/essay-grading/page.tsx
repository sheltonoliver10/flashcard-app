"use client";

import Link from "next/link";

export default function EssayGradingPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white p-12 rounded-lg shadow-md">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Essay Grading</h1>
          <p className="text-2xl text-gray-700 mb-8">Coming soon...</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
}


