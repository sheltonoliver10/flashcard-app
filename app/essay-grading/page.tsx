"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

interface Essay {
  id: string;
  image_url: string | null;
  essay_text: string;
  feedback: string | null;
  score: number | null;
  max_score: number | null;
  status: 'pending' | 'reviewed' | 'graded';
  created_at: string;
}

export default function EssayGradingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "pdf" | null>(null);
  const [essayAnswer, setEssayAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"submit" | "my-essays">("submit");
  const [myEssays, setMyEssays] = useState<Essay[]>([]);
  const [loadingEssays, setLoadingEssays] = useState(false);

  const fetchMyEssays = async () => {
    if (!user) return;
    setLoadingEssays(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("essays")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setMyEssays(data || []);
    } catch (err) {
      console.error("Error fetching essays:", err);
    } finally {
      setLoadingEssays(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        router.push("/");
      } else if (activeTab === "my-essays") {
        fetchMyEssays();
      }
    };
    checkUser();
  }, [router, activeTab]);

  useEffect(() => {
    if (user && activeTab === "my-essays") {
      fetchMyEssays();
    }
  }, [activeTab, user]);

  const downloadEssayAsWord = (essay: Essay) => {
    const scoreSection = essay.score !== null && essay.max_score !== null 
      ? `<h2>Score: ${essay.score} out of ${essay.max_score}</h2>` 
      : '';
    
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Essay Submission</title>
        </head>
        <body>
          <h1>Essay Submission</h1>
          <p><strong>Submitted:</strong> ${new Date(essay.created_at).toLocaleString()}</p>
          <p><strong>Status:</strong> ${essay.status.charAt(0).toUpperCase() + essay.status.slice(1)}</p>
          ${scoreSection}
          ${essay.image_url ? `<p><strong>Image/PDF:</strong> ${essay.image_url}</p>` : ''}
          <h2>Essay Text:</h2>
          <div style="white-space: pre-wrap;">${essay.essay_text}</div>
          ${essay.feedback ? `<h2>Feedback:</h2><div style="white-space: pre-wrap;">${essay.feedback}</div>` : ''}
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `essay-${essay.id}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      
      setSelectedFile(file);
      
      // Determine file type
      const isPDF = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");
      
      if (isPDF) {
        setFileType("pdf");
        // Create preview URL for PDF
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else if (isImage) {
        setFileType("image");
        // Create preview URL for image
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please upload an image (PNG, JPG, GIF) or PDF file");
        return;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFile || !essayAnswer.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const supabase = createSupabaseBrowserClient();

      // Upload file (image or PDF) to Supabase Storage
      let fileUrl = null;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('ESSAYS')
          .upload(fileName, selectedFile);

        if (uploadError) {
          // If bucket doesn't exist, create it (this will need to be done in Supabase dashboard)
          throw new Error(`Failed to upload file: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('ESSAYS')
          .getPublicUrl(fileName);
        fileUrl = urlData.publicUrl;
      }

      // Save essay to database
      const { error: insertError } = await supabase
        .from('essays')
        .insert({
          user_id: user.id,
          image_url: fileUrl,
          essay_text: essayAnswer,
          status: 'pending'
        });

      if (insertError) {
        throw new Error(`Failed to save essay: ${insertError.message}`);
      }

      // Success - clear form and show message
      setSelectedFile(null);
      setFilePreview(null);
      setFileType(null);
      setEssayAnswer("");
      alert("Essay submitted successfully! It will appear in management mode for review.");
      // Refresh essays list
      if (activeTab === "my-essays") {
        fetchMyEssays();
      }
    } catch (error: any) {
      console.error("Error submitting essay:", error);
      setSubmitError(error.message || "Failed to submit essay. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-block mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
          >
            ← Return to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Essay Grading</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab("submit")}
            className={`px-4 py-2 font-medium ${
              activeTab === "submit"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Submit Essay
          </button>
          <button
            onClick={() => {
              setActiveTab("my-essays");
              if (user) fetchMyEssays();
            }}
            className={`px-4 py-2 font-medium ${
              activeTab === "my-essays"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            My Essays
          </button>
        </div>

        {/* Submit Tab */}
        {activeTab === "submit" && (
        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Essay Image or PDF
              </label>
              <div className="mt-1">
                {!filePreview ? (
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF, or PDF up to 10MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {fileType === "image" ? (
                      <img
                        src={filePreview}
                        alt="Essay preview"
                        className="max-w-full h-auto rounded-lg border border-gray-300"
                      />
                    ) : fileType === "pdf" ? (
                      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center gap-3 mb-2">
                          <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="font-medium text-gray-900">{selectedFile?.name}</p>
                            <p className="text-sm text-gray-500">PDF Document</p>
                          </div>
                        </div>
                        <iframe
                          src={filePreview}
                          className="w-full h-96 rounded border border-gray-300"
                          title="PDF preview"
                        />
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview(null);
                        setFileType(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                      aria-label="Remove file"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Essay Answer Text Box */}
            <div>
              <label
                htmlFor="essay-answer"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Answer
              </label>
              <textarea
                id="essay-answer"
                name="essay-answer"
                rows={12}
                value={essayAnswer}
                onChange={(e) => setEssayAnswer(e.target.value)}
                placeholder="Paste or type your essay answer here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 resize-y"
              />
              <p className="mt-2 text-sm text-gray-500">
                {essayAnswer.length} characters
              </p>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {submitError}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!selectedFile || !essayAnswer.trim() || isSubmitting || !user}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Submit for Review"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setFilePreview(null);
                  setFileType(null);
                  setEssayAnswer("");
                }}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>
        )}

        {/* My Essays Tab */}
        {activeTab === "my-essays" && (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">My Submitted Essays</h2>
            
            {loadingEssays ? (
              <p className="text-gray-600">Loading essays...</p>
            ) : myEssays.length === 0 ? (
              <p className="text-gray-600">You haven't submitted any essays yet.</p>
            ) : (
              <div className="space-y-4">
                {myEssays.map((essay) => (
                  <div key={essay.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          Submitted: {new Date(essay.created_at).toLocaleString()}
                        </div>
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          essay.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          essay.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {essay.status.charAt(0).toUpperCase() + essay.status.slice(1)}
                        </div>
                      </div>
                      {essay.feedback && (
                        <button
                          onClick={() => downloadEssayAsWord(essay)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                        >
                          Download Word Doc
                        </button>
                      )}
                    </div>

                    {essay.score !== null && essay.max_score !== null && (
                      <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                        <span className="text-xl font-bold text-green-700">
                          Score: {essay.score} out of {essay.max_score}
                        </span>
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Essay Text:</div>
                      <div className="p-3 bg-gray-50 rounded whitespace-pre-wrap break-words border border-gray-200 max-h-40 overflow-y-auto">
                        {essay.essay_text}
                      </div>
                    </div>

                    {essay.feedback && (
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Feedback:</div>
                        <div className="p-3 bg-blue-50 rounded whitespace-pre-wrap break-words border border-blue-200">
                          {essay.feedback}
                        </div>
                      </div>
                    )}

                    {!essay.feedback && (
                      <p className="text-gray-500 text-sm italic">Waiting for feedback...</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}


