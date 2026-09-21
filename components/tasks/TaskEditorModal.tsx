"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useApp, formatTimeAmPm } from "@/context/AppContext";
import { TaskActivity } from "@/types";
import { History, Trash2, AlertCircle } from "lucide-react";

export function TaskEditorModal() {
  const {
    editingTask,
    setEditingTask,
    updateTaskActivity,
    deleteTaskActivity,
    taskRevisions,
  } = useApp();

  const [title, setTitle] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationDisplay, setDurationDisplay] = useState("0m");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setError(null);

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

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${editingTask.title}"?`)) {
      deleteTaskActivity(editingTask.id);
      handleClose();
    }
  };

  // Find any revisions for this task
  const revisions = taskRevisions.filter((r) => r.task_id === editingTask.id);

  return (
    <Modal
      isOpen={!!editingTask}
      onClose={handleClose}
      title="Task time editor"
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Task Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Task name
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-white"
          />
        </div>

        {/* Date Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Date
          </label>
          <input
            type="date"
            required
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
          />
        </div>

        {/* Start and End Times */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Start time
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              End time {editingTask.status === "Ongoing" && "(leave empty for ongoing)"}
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="Now / Ongoing"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
            />
          </div>
        </div>

        {/* Total Duration Readout matching mockup media_1789995922890.png */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <span className="font-semibold text-slate-600">Total duration</span>
          <span className="font-bold text-slate-900 text-sm">{durationDisplay}</span>
        </div>

        {/* Task Edit History matching mockup media_1789996039958.png */}
        {revisions.length > 0 && (
          <div className="p-3 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
              <History className="w-3.5 h-3.5 text-blue-400" />
              <span>Task edit history</span>
            </div>
            {revisions.map((rev) => (
              <div key={rev.id} className="pt-1.5 border-t border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Original time</span>
                  <span className="font-mono text-slate-200">
                    {formatTimeAmPm(rev.original_start)} – {rev.original_end ? formatTimeAmPm(rev.original_end) : "Now"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Updated time</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {formatTimeAmPm(rev.updated_start)} – {rev.updated_end ? formatTimeAmPm(rev.updated_end) : "Now"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 pt-0.5 flex items-center gap-1">
                  <span>🕒 Edited by {rev.edited_by_name}</span>
                  {rev.was_live_recorded && <span>• Time recorded automatically</span>}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Actions Footer matching mockup */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:underline select-none"
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4"
            >
              Save changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
