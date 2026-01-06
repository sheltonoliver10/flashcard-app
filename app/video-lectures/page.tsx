"use client";

import Link from "next/link";

export default function VideoLecturesPage() {
  // YouTube video ID
  const youtubeVideoId: string = "jB3w3a0aBnM";

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-block mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
          >
            ← Return to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Video Lectures</h1>
        </div>

        {/* Video Embed */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {!youtubeVideoId || youtubeVideoId.trim() === "" ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-700 mb-4">Please add your YouTube video ID</p>
              <p className="text-gray-600 text-sm">
                Edit the <code className="bg-gray-100 px-2 py-1 rounded">youtubeVideoId</code> variable in the code
              </p>
            </div>
          ) : (
            <div className="aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                title="Video Lecture"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

