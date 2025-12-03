"use client";

import { useState, useEffect, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Subject {
  id: string;
  name: string;
}

interface Subtopic {
  id: string;
  name: string;
  subject_id: string;
  display_order?: number;
}

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  subject_id: string;
  subtopic_id: string;
  display_order?: number;
  created_at?: string;
}

// Sortable Flashcard Item Component
function SortableFlashcardItem({
  flashcard,
  index,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  flashcard: Flashcard;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: flashcard.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border border-gray-200 rounded-md bg-white cursor-move hover:border-blue-400"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
            title="Drag to reorder"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="2" cy="2" r="1" />
              <circle cx="6" cy="2" r="1" />
              <circle cx="10" cy="2" r="1" />
              <circle cx="2" cy="6" r="1" />
              <circle cx="6" cy="6" r="1" />
              <circle cx="10" cy="6" r="1" />
              <circle cx="2" cy="10" r="1" />
              <circle cx="6" cy="10" r="1" />
              <circle cx="10" cy="10" r="1" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className={`px-2 py-1 text-xs rounded ${
                canMoveUp
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              title="Move up"
            >
              ↑
            </button>
            <button
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className={`px-2 py-1 text-xs rounded ${
                canMoveDown
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              title="Move down"
            >
              ↓
            </button>
          </div>
          <span className="text-xs text-gray-400">
            #{index + 1}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Front:</div>
          <div className="p-2 bg-gray-50 rounded whitespace-pre-wrap break-words">{flashcard.front_text}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Back:</div>
          <div className="p-2 bg-gray-50 rounded whitespace-pre-wrap break-words">{flashcard.back_text}</div>
        </div>
      </div>
    </div>
  );
}

// Sortable Subtopic Item Component
function SortableSubtopicItem({
  subtopic,
  index,
  onEdit,
  onDelete,
}: {
  subtopic: Subtopic;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtopic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-white cursor-move hover:border-blue-400"
    >
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
          title="Drag to reorder"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="2" cy="2" r="1" />
            <circle cx="6" cy="2" r="1" />
            <circle cx="10" cy="2" r="1" />
            <circle cx="2" cy="6" r="1" />
            <circle cx="6" cy="6" r="1" />
            <circle cx="10" cy="6" r="1" />
            <circle cx="2" cy="10" r="1" />
            <circle cx="6" cy="10" r="1" />
            <circle cx="10" cy="10" r="1" />
          </svg>
        </div>
        <span className="text-xs text-gray-400">#{index + 1}</span>
        <span className="font-medium">{subtopic.name}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export function FlashcardManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"subjects" | "subtopics" | "flashcards">("subjects");
  const [expandedSubtopics, setExpandedSubtopics] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Form states
  const [subjectForm, setSubjectForm] = useState({ name: "" });
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  const [subtopicForm, setSubtopicForm] = useState({ name: "", subject_id: "" });
  const [editingSubtopic, setEditingSubtopic] = useState<Subtopic | null>(null);
  
  const [flashcardForm, setFlashcardForm] = useState({ 
    front_text: "", 
    back_text: "", 
    subject_id: "", 
    subtopic_id: "" 
  });
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const flashcardFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (subtopicForm.subject_id) {
      fetchSubtopicsForSubject(subtopicForm.subject_id);
    }
  }, [subtopicForm.subject_id]);

  useEffect(() => {
    if (flashcardForm.subject_id) {
      fetchSubtopicsForSubject(flashcardForm.subject_id);
    }
  }, [flashcardForm.subject_id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      
      const [subjectsRes, subtopicsRes, flashcardsRes] = await Promise.all([
        supabase.from("subjects").select("*").order("name"),
        supabase.from("subtopics").select("*"),
        supabase.from("flashcards").select("*")
      ]);

      if (subjectsRes.error) {
        console.error("Subjects error:", subjectsRes.error);
        throw subjectsRes.error;
      }
      if (subtopicsRes.error) {
        console.error("Subtopics error:", subtopicsRes.error);
        throw subtopicsRes.error;
      }
      if (flashcardsRes.error) {
        console.error("Flashcards error:", flashcardsRes.error);
        throw flashcardsRes.error;
      }

      const flashcardsData = flashcardsRes.data || [];
      const subtopicsData = subtopicsRes.data || [];
      
      // Sort subtopics: first by display_order if it exists, otherwise by name
      let sortedSubtopics = [...subtopicsData];
      sortedSubtopics.sort((a, b) => {
        // If same subject, sort by display_order if it exists
        if (a.subject_id === b.subject_id) {
          if (a.display_order !== undefined && b.display_order !== undefined) {
            return a.display_order - b.display_order;
          }
          // Otherwise sort by name
          return a.name.localeCompare(b.name);
        }
        // Different subjects - sort by subject name (via subject_id)
        return a.subject_id.localeCompare(b.subject_id);
      });

      // Sort flashcards: first by display_order if it exists, otherwise by created_at
      let sortedFlashcards = [...flashcardsData];
      sortedFlashcards.sort((a, b) => {
        // If display_order exists, use it
        if (a.display_order !== undefined && b.display_order !== undefined) {
          return a.display_order - b.display_order;
        }
        // Otherwise fall back to created_at
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return aTime - bTime;
      });

      setSubjects(subjectsRes.data || []);
      setSubtopics(sortedSubtopics);
      setFlashcards(sortedFlashcards);
      setFetchError(null);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      const errorMsg = err.message || "Unknown error";
      setFetchError(`Failed to load flashcards: ${errorMsg}`);
      console.error("Full error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubtopicsForSubject = async (subjectId: string) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("subtopics")
        .select("*")
        .eq("subject_id", subjectId)
        .order("name");
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching subtopics:", err);
      return [];
    }
  };

  // Subject CRUD
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) return;

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("subjects").insert({ name: subjectForm.name.trim() });
      
      if (error) throw error;
      
      setSubjectForm({ name: "" });
      fetchData();
      alert("Subject created successfully!");
    } catch (err: any) {
      alert(`Failed to create subject: ${err.message}`);
    }
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !subjectForm.name.trim()) return;

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("subjects")
        .update({ name: subjectForm.name.trim() })
        .eq("id", editingSubject.id);
      
      if (error) throw error;
      
      setEditingSubject(null);
      setSubjectForm({ name: "" });
      fetchData();
      alert("Subject updated successfully!");
    } catch (err: any) {
      alert(`Failed to update subject: ${err.message}`);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Are you sure? This will delete all subtopics and flashcards in this subject.")) return;

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      
      if (error) throw error;
      
      fetchData();
      alert("Subject deleted successfully!");
    } catch (err: any) {
      alert(`Failed to delete subject: ${err.message}`);
    }
  };

  const startEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectForm({ name: subject.name });
  };

  const cancelEditSubject = () => {
    setEditingSubject(null);
    setSubjectForm({ name: "" });
  };

  // Subtopic CRUD
  const handleCreateSubtopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtopicForm.name.trim() || !subtopicForm.subject_id) return;

    try {
      const supabase = createSupabaseBrowserClient();
      
      // Try to get display_order if column exists
      let insertData: any = {
        name: subtopicForm.name.trim(),
        subject_id: subtopicForm.subject_id
      };
      
      try {
        const { data: existingSubtopics, error: orderError } = await supabase
          .from("subtopics")
          .select("display_order")
          .eq("subject_id", subtopicForm.subject_id)
          .order("display_order", { ascending: false })
          .limit(1);
        
        if (!orderError && existingSubtopics) {
          const maxOrder = existingSubtopics.length > 0 
            ? (existingSubtopics[0].display_order ?? -1) + 1 
            : 0;
          insertData.display_order = maxOrder;
        }
      } catch (orderErr) {
        // Column doesn't exist yet - that's fine
        console.log("display_order column not available for subtopics, skipping");
      }
      
      const { error } = await supabase.from("subtopics").insert(insertData);
      
      if (error) throw error;
      
      setSubtopicForm({ name: "", subject_id: "" });
      fetchData();
      alert("Subtopic created successfully!");
    } catch (err: any) {
      alert(`Failed to create subtopic: ${err.message}`);
    }
  };

  const handleUpdateSubtopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubtopic || !subtopicForm.name.trim()) return;

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("subtopics")
        .update({ name: subtopicForm.name.trim() })
        .eq("id", editingSubtopic.id);
      
      if (error) throw error;
      
      setEditingSubtopic(null);
      setSubtopicForm({ name: "", subject_id: "" });
      fetchData();
      alert("Subtopic updated successfully!");
    } catch (err: any) {
      alert(`Failed to update subtopic: ${err.message}`);
    }
  };

  const handleDeleteSubtopic = async (id: string) => {
    if (!confirm("Are you sure? This will delete all flashcards in this subtopic.")) return;

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("subtopics").delete().eq("id", id);
      
      if (error) throw error;
      
      fetchData();
      alert("Subtopic deleted successfully!");
    } catch (err: any) {
      alert(`Failed to delete subtopic: ${err.message}`);
    }
  };

  const startEditSubtopic = (subtopic: Subtopic) => {
    setEditingSubtopic(subtopic);
    setSubtopicForm({ name: subtopic.name, subject_id: subtopic.subject_id });
  };

  const cancelEditSubtopic = () => {
    setEditingSubtopic(null);
    setSubtopicForm({ name: "", subject_id: "" });
  };

  // Move subtopic up in order
  const handleMoveSubtopicUp = async (subtopic: Subtopic) => {
    const sameSubjectSubtopics = subtopics
      .filter(s => s.subject_id === subtopic.subject_id)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    
    const currentIndex = sameSubjectSubtopics.findIndex(s => s.id === subtopic.id);
    if (currentIndex <= 0) return; // Already at top
    
    const previousSubtopic = sameSubjectSubtopics[currentIndex - 1];
    const currentOrder = subtopic.display_order ?? 0;
    const previousOrder = previousSubtopic.display_order ?? 0;
    
    try {
      const supabase = createSupabaseBrowserClient();
      await Promise.all([
        supabase.from("subtopics").update({ display_order: previousOrder }).eq("id", subtopic.id),
        supabase.from("subtopics").update({ display_order: currentOrder }).eq("id", previousSubtopic.id)
      ]);
      fetchData();
    } catch (err: any) {
      alert(`Failed to reorder: ${err.message}`);
    }
  };

  // Move subtopic down in order
  const handleMoveSubtopicDown = async (subtopic: Subtopic) => {
    const sameSubjectSubtopics = subtopics
      .filter(s => s.subject_id === subtopic.subject_id)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    
    const currentIndex = sameSubjectSubtopics.findIndex(s => s.id === subtopic.id);
    if (currentIndex >= sameSubjectSubtopics.length - 1) return; // Already at bottom
    
    const nextSubtopic = sameSubjectSubtopics[currentIndex + 1];
    const currentOrder = subtopic.display_order ?? 0;
    const nextOrder = nextSubtopic.display_order ?? 0;
    
    try {
      const supabase = createSupabaseBrowserClient();
      await Promise.all([
        supabase.from("subtopics").update({ display_order: nextOrder }).eq("id", subtopic.id),
        supabase.from("subtopics").update({ display_order: currentOrder }).eq("id", nextSubtopic.id)
      ]);
      fetchData();
    } catch (err: any) {
      alert(`Failed to reorder: ${err.message}`);
    }
  };

  // Group subtopics by subject
  const getGroupedSubtopics = () => {
    const grouped: Record<string, Subtopic[]> = {};
    
    subtopics.forEach((subtopic) => {
      const subjectName = getSubjectName(subtopic.subject_id);
      if (!grouped[subjectName]) {
        grouped[subjectName] = [];
      }
      grouped[subjectName].push(subtopic);
    });
    
    // Sort subtopics within each subject by display_order
    Object.keys(grouped).forEach((subjectName) => {
      grouped[subjectName].sort((a, b) => 
        (a.display_order ?? 0) - (b.display_order ?? 0)
      );
    });
    
    return grouped;
  };

  // Handle drag end for flashcards
  const handleFlashcardDragEnd = async (event: DragEndEvent, subtopicId: string) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const sameSubtopicCards = flashcards
      .filter(f => f.subtopic_id === subtopicId)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    
    const oldIndex = sameSubtopicCards.findIndex(f => f.id === active.id);
    const newIndex = sameSubtopicCards.findIndex(f => f.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    const reorderedCards = arrayMove(sameSubtopicCards, oldIndex, newIndex);
    
    // Update display_order for all flashcards in this subtopic
    try {
      const supabase = createSupabaseBrowserClient();
      
      // Check if display_order column exists
      const testUpdate = await supabase
        .from("flashcards")
        .update({ display_order: 0 })
        .eq("id", reorderedCards[0].id)
        .select();
      
      if (testUpdate.error && testUpdate.error.message.includes("display_order")) {
        alert("Please run the migration (003_add_flashcard_order.sql) to enable drag-and-drop reordering.");
        return;
      }
      
      // Update display_order for all flashcards
      const updates = reorderedCards.map((card, index) =>
        supabase.from("flashcards").update({ display_order: index }).eq("id", card.id)
      );
      
      await Promise.all(updates);
      fetchData();
    } catch (err: any) {
      if (err.message && err.message.includes("display_order")) {
        alert("Please run the migration (003_add_flashcard_order.sql) to enable drag-and-drop reordering.");
      } else {
        alert(`Failed to reorder flashcards: ${err.message}`);
      }
    }
  };

  // Handle drag end for subtopics
  const handleSubtopicDragEnd = async (event: DragEndEvent, subjectId: string) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const sameSubjectSubtopics = subtopics
      .filter(s => s.subject_id === subjectId)
      .sort((a, b) => {
        // Sort by display_order if available, otherwise by name
        if (a.display_order !== undefined && b.display_order !== undefined) {
          return a.display_order - b.display_order;
        }
        return a.name.localeCompare(b.name);
      });
    
    const oldIndex = sameSubjectSubtopics.findIndex(s => s.id === active.id);
    const newIndex = sameSubjectSubtopics.findIndex(s => s.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    const reorderedSubtopics = arrayMove(sameSubjectSubtopics, oldIndex, newIndex);
    
    // Update display_order for all subtopics in this subject
    try {
      const supabase = createSupabaseBrowserClient();
      
      // Check if display_order column exists by trying to update one subtopic
      const testUpdate = await supabase
        .from("subtopics")
        .update({ display_order: 0 })
        .eq("id", reorderedSubtopics[0].id)
        .select();
      
      if (testUpdate.error && testUpdate.error.message.includes("display_order")) {
        alert("Please run the migration (004_add_subtopic_order.sql) to enable drag-and-drop reordering.");
        return;
      }
      
      // Update display_order for all subtopics
      const updates = reorderedSubtopics.map((subtopic, index) =>
        supabase.from("subtopics").update({ display_order: index }).eq("id", subtopic.id)
      );
      
      await Promise.all(updates);
      fetchData();
    } catch (err: any) {
      if (err.message && err.message.includes("display_order")) {
        alert("Please run the migration (004_add_subtopic_order.sql) to enable drag-and-drop reordering.");
      } else {
        alert(`Failed to reorder subtopics: ${err.message}`);
      }
    }
  };

  // Flashcard CRUD
  const handleCreateFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flashcardForm.front_text.trim() || !flashcardForm.back_text.trim() || !flashcardForm.subject_id || !flashcardForm.subtopic_id) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      
      // Try to get display_order if column exists, otherwise skip it
      let insertData: any = {
        front_text: flashcardForm.front_text.trim(),
        back_text: flashcardForm.back_text.trim(),
        subject_id: flashcardForm.subject_id,
        subtopic_id: flashcardForm.subtopic_id
      };
      
      // Only try to set display_order if the column exists (migration has been run)
      try {
        const { data: existingCards, error: orderError } = await supabase
          .from("flashcards")
          .select("display_order")
          .eq("subtopic_id", flashcardForm.subtopic_id)
          .order("display_order", { ascending: false })
          .limit(1);
        
        // If query succeeds, column exists - use it
        if (!orderError && existingCards) {
          const maxOrder = existingCards.length > 0 
            ? (existingCards[0].display_order ?? -1) + 1 
            : 0;
          insertData.display_order = maxOrder;
        }
      } catch (orderErr) {
        // Column doesn't exist yet - that's fine, just don't include it
        console.log("display_order column not available, skipping");
      }
      
      const { error } = await supabase.from("flashcards").insert(insertData);
      
      if (error) throw error;
      
      setFlashcardForm({ front_text: "", back_text: "", subject_id: "", subtopic_id: "" });
      fetchData();
      alert("Flashcard created successfully!");
    } catch (err: any) {
      alert(`Failed to create flashcard: ${err.message}`);
    }
  };

  const handleUpdateFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlashcard || !flashcardForm.front_text.trim() || !flashcardForm.back_text.trim()) return;

    try {
      const supabase = createSupabaseBrowserClient();
      
      // Only update basic fields - don't try to update display_order if column doesn't exist
      const updateData: any = {
        front_text: flashcardForm.front_text.trim(),
        back_text: flashcardForm.back_text.trim(),
        subject_id: flashcardForm.subject_id,
        subtopic_id: flashcardForm.subtopic_id
      };
      
      const { error } = await supabase
        .from("flashcards")
        .update(updateData)
        .eq("id", editingFlashcard.id);
      
      if (error) throw error;
      
      setEditingFlashcard(null);
      setFlashcardForm({ front_text: "", back_text: "", subject_id: "", subtopic_id: "" });
      fetchData();
      alert("Flashcard updated successfully!");
    } catch (err: any) {
      alert(`Failed to update flashcard: ${err.message}`);
    }
  };

  const handleDeleteFlashcard = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flashcard?")) return;

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("flashcards").delete().eq("id", id);
      
      if (error) throw error;
      
      fetchData();
      alert("Flashcard deleted successfully!");
    } catch (err: any) {
      alert(`Failed to delete flashcard: ${err.message}`);
    }
  };

  const startEditFlashcard = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard);
    setFlashcardForm({
      front_text: flashcard.front_text,
      back_text: flashcard.back_text,
      subject_id: flashcard.subject_id,
      subtopic_id: flashcard.subtopic_id
    });
    // Scroll to form and focus first input
    setTimeout(() => {
      flashcardFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const cancelEditFlashcard = () => {
    setEditingFlashcard(null);
    setFlashcardForm({ front_text: "", back_text: "", subject_id: "", subtopic_id: "" });
  };

  // Export all flashcards as plain text
  const exportAllFlashcardsAsText = () => {
    const grouped = getGroupedFlashcards();
    let text = "";
    
    Object.entries(grouped)
      .sort(([subjectA], [subjectB]) => subjectA.localeCompare(subjectB))
      .forEach(([subjectName, subtopics]) => {
        text += `=== ${subjectName} ===\n\n`;
        
        Object.entries(subtopics)
          .sort(([subtopicA], [subtopicB]) => subtopicA.localeCompare(subtopicB))
          .forEach(([subtopicName, cards]) => {
            text += `--- ${subtopicName} ---\n\n`;
            
            cards.forEach((card, index) => {
              text += `Card ${index + 1}:\n`;
              text += `Front: ${card.front_text}\n`;
              text += `Back: ${card.back_text}\n\n`;
            });
          });
        
        text += "\n";
      });
    
    return text;
  };

  // Copy all flashcards to clipboard
  const handleCopyAllFlashcards = async () => {
    const text = exportAllFlashcardsAsText();
    
    try {
      await navigator.clipboard.writeText(text);
      alert(`Successfully copied ${flashcards.length} flashcard(s) to clipboard!`);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert(`Successfully copied ${flashcards.length} flashcard(s) to clipboard!`);
    }
  };

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || "Unknown";
  const getSubtopicName = (id: string) => subtopics.find(s => s.id === id)?.name || "Unknown";

  // Filter flashcards by search query
  const filterFlashcards = (cards: Flashcard[]) => {
    if (!searchQuery.trim()) return cards;
    
    const query = searchQuery.toLowerCase().trim();
    return cards.filter(card => 
      card.front_text.toLowerCase().includes(query) ||
      card.back_text.toLowerCase().includes(query)
    );
  };

  // Group flashcards by subject and subtopic
  const getGroupedFlashcards = () => {
    const grouped: Record<string, Record<string, Flashcard[]>> = {};
    
    // First filter flashcards by search query
    const filteredCards = filterFlashcards(flashcards);
    
    filteredCards.forEach((flashcard) => {
      if (!flashcard.subject_id || !flashcard.subtopic_id) {
        console.warn("Flashcard missing subject_id or subtopic_id:", flashcard);
        return; // Skip flashcards without proper grouping info
      }
      
      const subjectName = getSubjectName(flashcard.subject_id);
      const subtopicName = getSubtopicName(flashcard.subtopic_id);
      
      if (!grouped[subjectName]) {
        grouped[subjectName] = {};
      }
      if (!grouped[subjectName][subtopicName]) {
        grouped[subjectName][subtopicName] = [];
      }
      
      grouped[subjectName][subtopicName].push(flashcard);
    });
    
    // Sort flashcards within each subtopic by display_order
    Object.keys(grouped).forEach((subjectName) => {
      Object.keys(grouped[subjectName]).forEach((subtopicName) => {
        grouped[subjectName][subtopicName].sort((a, b) => 
          (a.display_order ?? 0) - (b.display_order ?? 0)
        );
      });
    });
    
    return grouped;
  };

  // Move flashcard up in order
  const handleMoveUp = async (flashcard: Flashcard) => {
    const sameSubtopicCards = flashcards
      .filter(f => f.subtopic_id === flashcard.subtopic_id)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    
    const currentIndex = sameSubtopicCards.findIndex(f => f.id === flashcard.id);
    if (currentIndex <= 0) return; // Already at top
    
    const previousCard = sameSubtopicCards[currentIndex - 1];
    const currentOrder = flashcard.display_order ?? 0;
    const previousOrder = previousCard.display_order ?? 0;
    
    try {
      const supabase = createSupabaseBrowserClient();
      await Promise.all([
        supabase.from("flashcards").update({ display_order: previousOrder }).eq("id", flashcard.id),
        supabase.from("flashcards").update({ display_order: currentOrder }).eq("id", previousCard.id)
      ]);
      fetchData();
    } catch (err: any) {
      alert(`Failed to reorder: ${err.message}`);
    }
  };

  // Move flashcard down in order
  const handleMoveDown = async (flashcard: Flashcard) => {
    const sameSubtopicCards = flashcards
      .filter(f => f.subtopic_id === flashcard.subtopic_id)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    
    const currentIndex = sameSubtopicCards.findIndex(f => f.id === flashcard.id);
    if (currentIndex >= sameSubtopicCards.length - 1) return; // Already at bottom
    
    const nextCard = sameSubtopicCards[currentIndex + 1];
    const currentOrder = flashcard.display_order ?? 0;
    const nextOrder = nextCard.display_order ?? 0;
    
    try {
      const supabase = createSupabaseBrowserClient();
      await Promise.all([
        supabase.from("flashcards").update({ display_order: nextOrder }).eq("id", flashcard.id),
        supabase.from("flashcards").update({ display_order: currentOrder }).eq("id", nextCard.id)
      ]);
      fetchData();
    } catch (err: any) {
      alert(`Failed to reorder: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Flashcard Management</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab("subjects")}
          className={`px-4 py-2 font-medium ${
            activeTab === "subjects"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Subjects
        </button>
        <button
          onClick={() => setActiveTab("subtopics")}
          className={`px-4 py-2 font-medium ${
            activeTab === "subtopics"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Subtopics
        </button>
        <button
          onClick={() => setActiveTab("flashcards")}
          className={`px-4 py-2 font-medium ${
            activeTab === "flashcards"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Flashcards
        </button>
      </div>

      {/* Subjects Tab */}
      {activeTab === "subjects" && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Manage Subjects</h3>
          
          {/* Create/Edit Form */}
          <form onSubmit={editingSubject ? handleUpdateSubject : handleCreateSubject} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm({ name: e.target.value })}
                placeholder="Subject name"
                className="flex-1 p-2 border border-gray-300 rounded-md"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingSubject ? "Update" : "Create"}
              </button>
              {editingSubject && (
                <button
                  type="button"
                  onClick={cancelEditSubject}
                  className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Subjects List */}
          <div className="space-y-2">
            {subjects.length === 0 ? (
              <p className="text-gray-500">No subjects yet. Create one above!</p>
            ) : (
              subjects.map((subject) => (
                <div key={subject.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                  <span className="font-medium">{subject.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditSubject(subject)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Subtopics Tab */}
      {activeTab === "subtopics" && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Manage Subtopics</h3>
          
          {editingSubtopic && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Editing:</strong> {editingSubtopic.name}
              </p>
            </div>
          )}
          
          {/* Create/Edit Form */}
          <form onSubmit={editingSubtopic ? handleUpdateSubtopic : handleCreateSubtopic} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-3">
              <select
                value={subtopicForm.subject_id}
                onChange={(e) => setSubtopicForm({ ...subtopicForm, subject_id: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
                disabled={!!editingSubtopic}
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={subtopicForm.name}
                  onChange={(e) => setSubtopicForm({ ...subtopicForm, name: e.target.value })}
                  placeholder="Subtopic name"
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingSubtopic ? "Update" : "Create"}
                </button>
                {editingSubtopic && (
                  <button
                    type="button"
                    onClick={cancelEditSubtopic}
                    className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Subtopics List - Grouped by Subject */}
          <div className="space-y-4">
            {subtopics.length === 0 ? (
              <p className="text-gray-500">No subtopics yet. Create one above!</p>
            ) : (
              Object.entries(getGroupedSubtopics())
                .sort(([subjectA], [subjectB]) => subjectA.localeCompare(subjectB))
                .map(([subjectName, subjectSubtopics]) => {
                  const subjectId = subjects.find(s => s.name === subjectName)?.id || "";
                  const subtopicIds = subjectSubtopics.map(s => s.id);
                  
                  return (
                    <div key={subjectName} className="border border-gray-300 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                        {subjectName}
                      </h4>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleSubtopicDragEnd(event, subjectId)}
                      >
                        <SortableContext
                          items={subtopicIds}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {subjectSubtopics.map((subtopic, index) => (
                              <SortableSubtopicItem
                                key={subtopic.id}
                                subtopic={subtopic}
                                index={index + 1}
                                onEdit={() => startEditSubtopic(subtopic)}
                                onDelete={() => handleDeleteSubtopic(subtopic.id)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* Flashcards Tab */}
      {activeTab === "flashcards" && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Manage Flashcards</h3>
          
          {fetchError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm font-medium">Error: {fetchError}</p>
              <p className="text-red-600 text-xs mt-1">Check browser console (F12) for details</p>
            </div>
          )}
          
          {/* Create/Edit Form */}
          {editingFlashcard && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Editing:</strong> {editingFlashcard.front_text.substring(0, 50)}
                {editingFlashcard.front_text.length > 50 ? "..." : ""}
              </p>
            </div>
          )}
          <form 
            ref={flashcardFormRef}
            onSubmit={editingFlashcard ? handleUpdateFlashcard : handleCreateFlashcard} 
            className="mb-6 p-4 bg-gray-50 rounded-lg"
          >
            <div className="space-y-3">
              <select
                value={flashcardForm.subject_id}
                onChange={(e) => setFlashcardForm({ ...flashcardForm, subject_id: e.target.value, subtopic_id: "" })}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              <select
                value={flashcardForm.subtopic_id}
                onChange={(e) => setFlashcardForm({ ...flashcardForm, subtopic_id: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
                disabled={!flashcardForm.subject_id}
              >
                <option value="">Select a subtopic</option>
                {subtopics
                  .filter(s => s.subject_id === flashcardForm.subject_id)
                  .map((subtopic) => (
                    <option key={subtopic.id} value={subtopic.id}>
                      {subtopic.name}
                    </option>
                  ))}
              </select>
              <textarea
                value={flashcardForm.front_text}
                onChange={(e) => setFlashcardForm({ ...flashcardForm, front_text: e.target.value })}
                placeholder="Front text (question)"
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
                required
              />
              <textarea
                value={flashcardForm.back_text}
                onChange={(e) => setFlashcardForm({ ...flashcardForm, back_text: e.target.value })}
                placeholder="Back text (answer)"
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingFlashcard ? "Update" : "Create"}
                </button>
                {editingFlashcard && (
                  <button
                    type="button"
                    onClick={cancelEditFlashcard}
                    className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search flashcards (front or back text)..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-600">
                Showing {filterFlashcards(flashcards).length} of {flashcards.length} flashcard(s)
              </p>
            )}
          </div>

          {/* Flashcards List */}
          <div className="space-y-6">
            {flashcards.length === 0 ? (
              <div>
                <p className="text-gray-500 mb-2">No flashcards yet. Create one above!</p>
                <p className="text-xs text-gray-400">Debug: flashcards array length is {flashcards.length}</p>
              </div>
            ) : filterFlashcards(flashcards).length === 0 ? (
              <div>
                <p className="text-gray-500 mb-2">No flashcards match your search "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Clear search
                </button>
              </div>
            ) : (
              (() => {
                console.log("Rendering flashcards, count:", flashcards.length);
                const grouped = getGroupedFlashcards();
                const groupedEntries = Object.entries(grouped);
                
                // Always show grouped if we have valid groups, otherwise show simple list
                if (groupedEntries.length > 0) {
                  // Get all subtopic keys for expand/collapse all
                  const allSubtopicKeys = new Set<string>();
                  groupedEntries.forEach(([subjectName, subjectSubtopics]) => {
                    Object.keys(subjectSubtopics).forEach(subtopicName => {
                      allSubtopicKeys.add(`${subjectName}-${subtopicName}`);
                    });
                  });
                  
                  return (
                    <>
                      <div className="mb-4 flex gap-2 flex-wrap">
                        <button
                          onClick={() => setExpandedSubtopics(new Set(allSubtopicKeys))}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Expand All
                        </button>
                        <button
                          onClick={() => setExpandedSubtopics(new Set())}
                          className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          Collapse All
                        </button>
                        <button
                          onClick={handleCopyAllFlashcards}
                          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          📋 Copy All Text for Proofreading
                        </button>
                      </div>
                      {groupedEntries
                        .sort(([subjectA], [subjectB]) => subjectA.localeCompare(subjectB))
                        .map(([subjectName, subtopics]) => (
                          <div key={subjectName} className="border border-gray-300 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                              {subjectName}
                            </h4>
                            <div className="space-y-4">
                          {Object.entries(subtopics)
                            .sort(([subtopicA], [subtopicB]) => subtopicA.localeCompare(subtopicB))
                            .map(([subtopicName, subtopicCards]) => {
                              const subtopicKey = `${subjectName}-${subtopicName}`;
                              const isExpanded = expandedSubtopics.has(subtopicKey);
                              
                              return (
                              <div key={subtopicName} className="ml-4">
                                <button
                                  onClick={() => {
                                    const newExpanded = new Set(expandedSubtopics);
                                    if (isExpanded) {
                                      newExpanded.delete(subtopicKey);
                                    } else {
                                      newExpanded.add(subtopicKey);
                                    }
                                    setExpandedSubtopics(newExpanded);
                                  }}
                                  className="flex items-center gap-2 w-full text-left mb-3 p-2 hover:bg-gray-50 rounded-md transition-colors"
                                >
                                  <svg
                                    className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  <h5 className="text-md font-medium text-gray-700">
                                    {subtopicName}
                                  </h5>
                                  <span className="text-sm text-gray-500 ml-auto">
                                    ({subtopicCards.length} card{subtopicCards.length !== 1 ? 's' : ''})
                                  </span>
                                </button>
                                {isExpanded && subtopicCards.length > 0 && (
                                  <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={(event) => handleFlashcardDragEnd(event, subtopicCards[0].subtopic_id)}
                                  >
                                    <SortableContext
                                      items={subtopicCards.map(c => c.id)}
                                      strategy={verticalListSortingStrategy}
                                    >
                                      <div className="space-y-3">
                                        {subtopicCards.map((flashcard, index) => {
                                          const sameSubtopicCards = flashcards
                                            .filter(f => f.subtopic_id === flashcard.subtopic_id)
                                            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
                                          const currentIndex = sameSubtopicCards.findIndex(f => f.id === flashcard.id);
                                          const canMoveUp = currentIndex > 0;
                                          const canMoveDown = currentIndex < sameSubtopicCards.length - 1;
                                          
                                          return (
                                            <SortableFlashcardItem
                                              key={flashcard.id}
                                              flashcard={flashcard}
                                              index={index + 1}
                                              onEdit={() => startEditFlashcard(flashcard)}
                                              onDelete={() => handleDeleteFlashcard(flashcard.id)}
                                              onMoveUp={() => handleMoveUp(flashcard)}
                                              onMoveDown={() => handleMoveDown(flashcard)}
                                              canMoveUp={canMoveUp}
                                              canMoveDown={canMoveDown}
                                            />
                                          );
                                        })}
                                      </div>
                                    </SortableContext>
                                  </DndContext>
                                )}
                              </div>
                            );
                            })}
                        </div>
                      </div>
                    ))}
                    </>
                  );
                } else {
                  // Fallback: show all flashcards in simple list
                  const filteredFlashcards = filterFlashcards(flashcards);
                  return (
                    <div className="space-y-3">
                      <div className="mb-4">
                        <button
                          onClick={handleCopyAllFlashcards}
                          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          📋 Copy All Text for Proofreading
                        </button>
                      </div>
                      <p className="text-sm text-yellow-600 mb-2">⚠️ Showing all flashcards (grouping unavailable)</p>
                      {filteredFlashcards.length === 0 ? (
                        <p className="text-gray-500">No flashcards match your search "{searchQuery}"</p>
                      ) : (
                        <>
                          {filteredFlashcards.map((flashcard) => (
                        <div key={flashcard.id} className="p-4 border border-gray-200 rounded-md">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-sm text-gray-500">
                              {getSubjectName(flashcard.subject_id)} → {getSubtopicName(flashcard.subtopic_id)}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditFlashcard(flashcard)}
                                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteFlashcard(flashcard.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Front:</div>
                              <div className="p-2 bg-gray-50 rounded whitespace-pre-wrap break-words">{flashcard.front_text}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Back:</div>
                              <div className="p-2 bg-gray-50 rounded whitespace-pre-wrap break-words">{flashcard.back_text}</div>
                            </div>
                          </div>
                        </div>
                          ))}
                        </>
                      )}
                    </div>
                  );
                }
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
}

