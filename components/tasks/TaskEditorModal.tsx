"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { Trash2, AlertCircle } from "lucide-react";

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

export function TaskEditorModal() {
  const {
    editingTask,
    setEditingTask,
    updateTaskActivity,
    deleteTaskActivity,
    checkOverlap,
  } = useApp();

  const [title, setTitle] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationDisplay, setDurationDisplay] = useState("0m");
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<string[]>(DEFAULT_SUGGESTED_TASKS);

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
    if (editingTask) {
      setTitle(editingTask.title);
      setError(null);
      setShowDeleteConfirm(false);

      const sDate = new Date(editingTask.start_at);
      const year = sDate.getFullYear();
      const month = String(sDate.getMonth() + 1).padStart(2, "0");
      const day = String(sDate.getDate()).padStart(2, "0");
      setDateStr(`${year}-${month}-${day}`);

      const sHours = String(sDate.getHours()).padStart(2, "0");
      const sMins = String(sDate.getMinutes()).padStart(2, "0");
      setStartTime(`${sHours}:${sMins}`);

      if (editingTask.end_at) {
        const eDate = new Date(editingTask.end_at);
        const eHours = String(eDate.getHours()).padStart(2, "0");
        const eMins = String(eDate.getMinutes()).padStart(2, "0");
        setEndTime(`${eHours}:${eMins}`);
      } else {
        setEndTime("");
      }
    }
  }, [editingTask]);

  // Recalculate duration whenever start or end times change
  useEffect(() => {
    if (startTime && endTime) {
      const [sH, sM] = startTime.split(":").map(Number);
      const [eH, eM] = endTime.split(":").map(Number);
      const startMinutes = sH * 60 + sM;
      const endMinutes = eH * 60 + eM;
      const diff = endMinutes - startMinutes;

      if (diff > 0) {
        const hrs = Math.floor(diff / 60);
        const mins = diff % 60;
        if (hrs > 0) {
          setDurationDisplay(`${hrs}h ${mins > 0 ? mins + "m" : "00m"}`);
        } else {
          setDurationDisplay(`${mins}m`);
        }
        setError(null);
      } else {
        setDurationDisplay("0m");
        setError("End time must be after start time");
      }
    } else if (startTime && !endTime) {
      setDurationDisplay("Ongoing");
      setError(null);
    }
  }, [startTime, endTime]);

  if (!editingTask) return null;

  const handleClose = () => {
    setShowDeleteConfirm(false);
    setEditingTask(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task name cannot be empty");
      return;
    }

    const startIso = new Date(`${dateStr}T${startTime}:00`).toISOString();
    const endIso = endTime ? new Date(`${dateStr}T${endTime}:00`).toISOString() : null;

    if (endIso && new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      setError("End time must be after start time");
      return;
    }

    if (endIso) {
      const conflict = checkOverlap(editingTask.employee_id, startIso, endIso, editingTask.id);
      if (conflict) {
        setError(`Cannot overlap tasks: Time slot conflicts with "${conflict.title}".`);
        return;
      }
    }

    updateTaskActivity(
      editingTask.id,
      {
        title: title.trim(),
        start_at: startIso,
        end_at: endIso,
      },
      "Manual time adjustment in Task Time Editor"
    );

    handleClose();
  };

  const handleConfirmDelete = () => {
    deleteTaskActivity(editingTask.id);
    handleClose();
  };

  return (
    <Modal
      isOpen={!!editingTask}
      onClose={handleClose}
      title={showDeleteConfirm ? "Delete Task" : "Task time editor"}
      maxWidth="md"
    >
      {showDeleteConfirm ? (
        <div className="py-2 space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400 mx-auto shadow-xs">
            <Trash2 className="w-7 h-7" />
          </div>

          <div className="text-center space-y-1.5">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              Are you sure you want to delete this task?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              You are about to permanently delete <span className="font-bold text-slate-800 dark:text-slate-200">&ldquo;{title || editingTask.title}&rdquo;</span>. All recorded duration for this slot will be removed.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-300 max-w-sm mx-auto">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>This action cannot be undone.</span>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="px-5 font-bold"
            >
              Cancel
            </Button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all cursor-pointer select-none"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete task</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Task Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task name
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white dark:bg-slate-800"
            />
            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {suggestedTasks.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setTitle(sug)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                    title === sug
                      ? "bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-600 dark:text-blue-400 font-bold"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                  title={`Click to set name to "${sug}"`}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Date Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
            />
          </div>

          {/* Start and End Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End time {editingTask.status === "Ongoing" && "(leave empty for ongoing)"}
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="Now / Ongoing"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Total Duration Readout */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Total duration</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{durationDisplay}</span>
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:underline select-none cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete task</span>
            </button>

            <div className="flex items-center gap-2">
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
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 cursor-pointer"
              >
                Save changes
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
