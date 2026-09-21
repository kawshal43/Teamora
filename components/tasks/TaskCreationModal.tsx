"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/context/AppContext";
import { TaskActivity } from "@/types";
import { PlayCircle, Clock, Calendar, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [category, setCategory] = useState<TaskActivity["category"]>("Development");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<"live" | "manual">("live");

  // Manual mode state
  const [manualDate, setManualDate] = useState("2026-09-21");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:30");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isCreateTaskModalOpen) {
      setError(null);
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
          setMode("manual");
        }
      } else {
        setMode("live");
      }
    }
  }, [isCreateTaskModalOpen, createTaskModalPrefill]);

  const handleClose = () => {
    setIsCreateTaskModalOpen(false);
    setCreateTaskModalPrefill(null);
    setTitle("");
    setDescription("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a task name.");
      return;
    }

    if (mode === "live") {
      const res = await startLiveTask(title, category, description);
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
        title,
        category,
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
        <p className="text-xs text-slate-500 -mt-2">
          Start working immediately or enter a time manually.
        </p>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Task Name Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Task name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Video editing"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white"
            autoFocus
          />
        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Category
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(["Development", "Design", "Planning", "Meeting", "Review", "General"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "py-1.5 px-2 text-xs rounded-lg border font-medium transition-all text-center",
                  category === cat
                    ? "bg-blue-50 border-blue-300 text-blue-700 font-bold"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selector Cards matching mockup media_1789995878002.png */}
        <div className="space-y-2 pt-1">
          {mode === "live" ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                <span>Start tracking immediately</span>
              </div>
              <p className="text-[11px] text-emerald-800/90 leading-relaxed pl-4.5">
                The task starts automatically when you select Add Task.
              </p>
              <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs font-semibold text-emerald-900 pl-4.5">
                <span>Start time</span>
                <span className="font-bold">Now</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 pl-4.5">
                <span>End time</span>
                <span className="text-emerald-700 font-medium">Automatically tracked</span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Manually scheduled activity</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMode("live")}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Track live instead
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Start time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    End time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
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
              className="text-xs text-blue-600 font-semibold hover:underline block pt-1"
            >
              Enter time manually
            </button>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
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
