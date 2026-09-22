"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { TaskActivity } from "@/types";
import { Clock, AlertCircle, Plus, Sparkles, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_SUGGESTED_TASKS = [
  "Video editing",
  "Social Media Scheduling",
  "Content Planning",
  "Code Review",
  "UI Design",
  "Team Standup",
  "Client Meeting",
  "Bug Fixing",
];

const STORAGE_KEY_TASK_SUGGESTIONS = "teamora_task_suggestions_v2";

/**
 * Automatically infers a matching category for backend activity classification
 * so the user never has to manually deal with rigid categories.
 */
function deduceCategory(taskTitle: string): TaskActivity["category"] {
  const lower = (taskTitle || "").toLowerCase();
  if (
    lower.includes("video") ||
    lower.includes("design") ||
    lower.includes("ui") ||
    lower.includes("ux") ||
    lower.includes("graphic")
  ) {
    return "Design";
  }
  if (
    lower.includes("code") ||
    lower.includes("bug") ||
    lower.includes("dev") ||
    lower.includes("fix") ||
    lower.includes("api") ||
    lower.includes("frontend") ||
    lower.includes("backend")
  ) {
    return "Development";
  }
  if (
    lower.includes("plan") ||
    lower.includes("schedule") ||
    lower.includes("roadmap") ||
    lower.includes("strategy") ||
    lower.includes("content")
  ) {
    return "Planning";
  }
  if (
    lower.includes("meet") ||
    lower.includes("standup") ||
    lower.includes("call") ||
    lower.includes("sync") ||
    lower.includes("interview")
  ) {
    return "Meeting";
  }
  if (
    lower.includes("review") ||
    lower.includes("audit") ||
    lower.includes("test") ||
    lower.includes("qa")
  ) {
    return "Review";
  }
  return "General";
}

export function TaskCreationModal() {
  const {
    currentUser,
    isCreateTaskModalOpen,
    setIsCreateTaskModalOpen,
    createTaskModalPrefill,
    setCreateTaskModalPrefill,
    startLiveTask,
    createManualTask,
  } = useApp();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<"live" | "manual">("live");

  // Dynamic suggested tasks state
  const [suggestedTasks, setSuggestedTasks] = useState<string[]>(DEFAULT_SUGGESTED_TASKS);
  const [isAddingSuggestion, setIsAddingSuggestion] = useState(false);
  const [newSuggestionInput, setNewSuggestionInput] = useState("");

  // Manual mode state
  const [manualDate, setManualDate] = useState("2026-09-21");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:30");
  const [error, setError] = useState<string | null>(null);

  // Load saved task suggestions from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY_TASK_SUGGESTIONS);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSuggestedTasks(parsed);
          }
        } catch (e) {
          console.error("Failed to parse saved task suggestions", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isCreateTaskModalOpen) {
      setError(null);
      setIsAddingSuggestion(false);
      setNewSuggestionInput("");
      if (createTaskModalPrefill) {
        if (createTaskModalPrefill.date) {
          setManualDate(createTaskModalPrefill.date);
        }
        if (createTaskModalPrefill.hour !== undefined) {
          const hStr = String(createTaskModalPrefill.hour).padStart(2, "0");
          const mStr = String(createTaskModalPrefill.minute ?? 0).padStart(2, "0");
          const nextHStr = String(Math.min(23, createTaskModalPrefill.hour + 1)).padStart(2, "0");
          setStartTime(`${hStr}:${mStr}`);
          setEndTime(`${nextHStr}:${mStr}`);
        }
      }
      // Default to live task tracking
      setMode("live");
    }
  }, [isCreateTaskModalOpen, createTaskModalPrefill]);

  const saveSuggestions = (updated: string[]) => {
    setSuggestedTasks(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_TASK_SUGGESTIONS, JSON.stringify(updated));
    }
  };

  const handleAddSuggestion = (nameToAdd?: string) => {
    const text = (nameToAdd ?? newSuggestionInput).trim();
    if (!text) return;
    if (!suggestedTasks.some((t) => t.toLowerCase() === text.toLowerCase())) {
      const updated = [...suggestedTasks, text];
      saveSuggestions(updated);
    }
    // Auto-fill title with the newly added suggestion
    setTitle(text);
    setNewSuggestionInput("");
    setIsAddingSuggestion(false);
    setError(null);
  };

  const handleDeleteSuggestion = (taskToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = suggestedTasks.filter((t) => t !== taskToDelete);
    saveSuggestions(updated.length > 0 ? updated : DEFAULT_SUGGESTED_TASKS);
  };

  const handleClose = () => {
    setIsCreateTaskModalOpen(false);
    setCreateTaskModalPrefill(null);
    setTitle("");
    setDescription("");
    setError(null);
    setIsAddingSuggestion(false);
    setNewSuggestionInput("");
    setMode("live");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim();
    if (!finalTitle) {
      setError("Please enter or select a task name.");
      return;
    }

    const autoCategory = deduceCategory(finalTitle);

    if (mode === "live") {
      const res = await startLiveTask(finalTitle, autoCategory, description);
      if (res.success) {
        handleClose();
      } else if (res.requiresSwitchConfirmation) {
        // Handled via switchModalData in AppContext
        setIsCreateTaskModalOpen(false);
      }
    } else {
      // Manual time validation
      const startAtIso = new Date(`${manualDate}T${startTime}:00`).toISOString();
      const endAtIso = new Date(`${manualDate}T${endTime}:00`).toISOString();

      if (new Date(endAtIso).getTime() <= new Date(startAtIso).getTime()) {
        setError("End time must be after start time.");
        return;
      }

      const res = createManualTask({
        title: finalTitle,
        category: autoCategory,
        description,
        start_at: startAtIso,
        end_at: endAtIso,
        employee_id: currentUser.id,
      });

      if (!res.success && res.conflict) {
        setError(`Time conflict! This overlaps with existing task "${res.conflict.title}".`);
        return;
      }

      handleClose();
    }
  };

  return (
    <Modal
      isOpen={isCreateTaskModalOpen}
      onClose={handleClose}
      title="Create a new task"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2">
          Start working immediately or enter a time manually.
        </p>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Task Name Input + Quick Save Action */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Task name <span className="text-red-500">*</span>
            </label>
            {title.trim() &&
              !suggestedTasks.some((s) => s.toLowerCase() === title.trim().toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => handleAddSuggestion(title.trim())}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  title="Save this task name into your suggestions"
                >
                  <Plus className="w-3 h-3" />
                  <span>Save as suggestion</span>
                </button>
              )}
          </div>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Video editing"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
            autoFocus
          />
        </div>

        {/* Suggested Tasks Section (Replaced Categories as requested) */}
        <div className="space-y-2 pt-0.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Suggested tasks</span>
            </label>
            <button
              type="button"
              onClick={() => setIsAddingSuggestion(!isAddingSuggestion)}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{isAddingSuggestion ? "Cancel" : "Add custom"}</span>
            </button>
          </div>

          {/* Inline Add Custom Suggestion Input */}
          {isAddingSuggestion && (
            <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-850 dark:bg-[#1a2234] rounded-xl border border-blue-200 dark:border-blue-900/60 animate-in fade-in zoom-in-95 duration-100">
              <input
                type="text"
                placeholder="Type custom task name..."
                value={newSuggestionInput}
                onChange={(e) => setNewSuggestionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSuggestion();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleAddSuggestion()}
                disabled={!newSuggestionInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingSuggestion(false);
                  setNewSuggestionInput("");
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Suggestion Pills Grid (Clicking auto-fills the task name) */}
          <div className="flex flex-wrap gap-1.5">
            {suggestedTasks.map((sug) => {
              const isSelected = title.trim().toLowerCase() === sug.toLowerCase();
              return (
                <div
                  key={sug}
                  onClick={() => {
                    setTitle(sug);
                    setError(null);
                  }}
                  className={cn(
                    "group relative flex items-center gap-1.5 py-1.5 px-3 text-xs rounded-xl border font-medium transition-all cursor-pointer select-none",
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/70 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 font-bold shadow-xs scale-[1.02]"
                      : "bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                  title={`Click to auto-fill "${sug}" as task name`}
                >
                  {isSelected && (
                    <Check className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                  )}
                  <span>{sug}</span>
                  {/* Delete button on hover */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSuggestion(sug, e)}
                    className="opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full p-0.5 text-slate-400 hover:text-red-500 transition-all ml-0.5"
                    title={`Remove "${sug}" from suggestions`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Click any task above to auto-fill the task name.
          </p>
        </div>

        {/* Mode Selector Cards matching mockup media_1789995878002.png */}
        <div className="space-y-2 pt-1">
          {mode === "live" ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 dark:text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100 dark:ring-emerald-900/50" />
                <span>Start tracking immediately</span>
              </div>
              <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed pl-4.5">
                The task starts automatically when you select Add Task.
              </p>
              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between text-xs font-semibold text-emerald-900 dark:text-emerald-300 pl-4.5">
                <span>Start time</span>
                <span className="font-bold">Now</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 dark:text-emerald-300 pl-4.5">
                <span>End time</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">Automatically tracked</span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Manually scheduled activity</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMode("live")}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                >
                  Track live instead
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Start time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    End time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Toggle between live and manual */}
          {mode === "live" && (
            <button
              type="button"
              onClick={() => setMode("manual")}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline block pt-1 cursor-pointer"
            >
              Enter time manually
            </button>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5"
          >
            Add Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
