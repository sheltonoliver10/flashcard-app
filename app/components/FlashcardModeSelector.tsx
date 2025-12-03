"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { FlashcardStudy } from "./FlashcardStudy";

interface Subject {
  id: string;
  name: string;
}

interface Subtopic {
  id: string;
  name: string;
  subject_id: string;
}

export function FlashcardModeSelector() {
  const [selectedMode, setSelectedMode] = useState<"subject" | "subtopic" | "random" | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase.from("subjects").select("id, name").order("name");
        if (error) throw error;
        setSubjects(data || []);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchSubtopics = async () => {
      if (!selectedSubjectId) {
        setSubtopics([]);
        return;
      }
      setLoading(true);
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("subtopics")
          .select("id, name, subject_id")
          .eq("subject_id", selectedSubjectId)
          .order("name");
        if (error) throw error;
        setSubtopics(data || []);
      } catch (err) {
        console.error("Error fetching subtopics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubtopics();
  }, [selectedSubjectId]);

  const handleModeSelect = (mode: "subject" | "subtopic" | "random") => {
    setSelectedMode(mode);
    if (mode === "random") {
      setSelectedSubjectId("");
      setSelectedSubtopicId("");
    }
  };

  const canStartStudy = () => {
    if (!selectedMode) return false;
    if (selectedMode === "subject") return !!selectedSubjectId;
    if (selectedMode === "subtopic") return !!selectedSubtopicId;
    if (selectedMode === "random") return true;
    return false;
  };

  const handleBackToHome = () => {
    setSelectedMode(null);
    setSelectedSubjectId("");
    setSelectedSubtopicId("");
  };

  // Show "Coming soon" for random mode
  if (selectedMode === "random") {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center min-h-[400px] flex items-center justify-center">
        <div>
          <button
            onClick={handleBackToHome}
            className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium flex items-center gap-2 mx-auto"
          >
            <span>←</span>
            <span>Return to Home</span>
          </button>
          <h2 className="text-3xl font-semibold text-gray-700">Coming soon...</h2>
        </div>
      </div>
    );
  }

  if (selectedMode && canStartStudy()) {
    return (
      <FlashcardStudy
        studyMode={selectedMode}
        subjectId={selectedMode === "subject" ? selectedSubjectId : undefined}
        subtopicId={selectedMode === "subtopic" ? selectedSubtopicId : undefined}
        onBack={handleBackToHome}
      />
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">Choose Your Study Mode</h2>

      {/* Mode Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How would you like to study?
        </label>
        <div className="space-y-3">
          <label className="flex items-center p-4 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="studyMode"
              value="subject"
              checked={selectedMode === "subject"}
              onChange={() => handleModeSelect("subject")}
              className="mr-3"
            />
            <div>
              <div className="font-medium">By Subject</div>
              <div className="text-sm text-gray-500">Study all flashcards for a specific subject</div>
            </div>
          </label>

          <label className="flex items-center p-4 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="studyMode"
              value="subtopic"
              checked={selectedMode === "subtopic"}
              onChange={() => handleModeSelect("subtopic")}
              className="mr-3"
            />
            <div>
              <div className="font-medium">By Subtopic</div>
              <div className="text-sm text-gray-500">Study flashcards for a specific subtopic</div>
            </div>
          </label>

          <label className="flex items-center p-4 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="studyMode"
              value="random"
              checked={selectedMode === "random"}
              onChange={() => handleModeSelect("random")}
              className="mr-3"
            />
            <div>
              <div className="font-medium">Random Mix</div>
              <div className="text-sm text-gray-500">Study 25 random flashcards from all topics</div>
            </div>
          </label>
        </div>
      </div>

      {/* Subject Selection */}
      {selectedMode === "subject" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Subject
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a subject...</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Subtopic Selection */}
      {selectedMode === "subtopic" && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedSubtopicId(""); // Reset subtopic when subject changes
              }}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a subject first...</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {selectedSubjectId && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Subtopic
              </label>
              {loading ? (
                <p className="text-gray-500">Loading subtopics...</p>
              ) : (
                <select
                  value={selectedSubtopicId}
                  onChange={(e) => setSelectedSubtopicId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!selectedSubjectId || subtopics.length === 0}
                >
                  <option value="">
                    {subtopics.length === 0 ? "No subtopics available" : "Choose a subtopic..."}
                  </option>
                  {subtopics.map((subtopic) => (
                    <option key={subtopic.id} value={subtopic.id}>
                      {subtopic.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </>
      )}

      {/* Back button */}
      {selectedMode && (
        <button
          onClick={() => {
            setSelectedMode(null);
            setSelectedSubjectId("");
            setSelectedSubtopicId("");
          }}
          className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          ← Back
        </button>
      )}
    </div>
  );
}

