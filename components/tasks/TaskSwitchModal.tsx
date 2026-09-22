"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { useApp, formatSecondsToHuman } from "@/context/AppContext";
import { ArrowRight, RotateCcw, AlertTriangle } from "lucide-react";

export function TaskSwitchModal() {
  const {
    activeTask,
    activeTaskElapsedSeconds,
    switchModalData,
    setSwitchModalData,
    confirmTaskSwitch,
  } = useApp();

  if (!switchModalData?.isOpen || !activeTask) {
    return null;
  }

  const handleConfirmSwitch = () => {
    confirmTaskSwitch(
      switchModalData.pendingTitle,
      switchModalData.pendingCategory,
      switchModalData.pendingDescription
    );
  };

  const handleCancel = () => {
    setSwitchModalData(null);
  };

  return (
    <Modal
      isOpen={switchModalData.isOpen}
      onClose={handleCancel}
      title="Switching to another task"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Current task card matching media_1789996030421.png */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1 shadow-inner">
          <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-900/80 text-emerald-400 border border-emerald-700/60 uppercase tracking-wide">
            Current task
          </span>
          <h4 className="text-base font-bold text-white pt-0.5">
            {activeTask.title}
          </h4>
          <p className="text-xs text-slate-400 font-medium">
            Ongoing • {formatSecondsToHuman(activeTaskElapsedSeconds)}
          </p>
        </div>

        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          You already have an ongoing task. What would you like to do?
        </p>

        {/* Choice 1: End previous and start new */}
        <button
          onClick={handleConfirmSwitch}
          className="w-full text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50/50 dark:hover:bg-slate-700/60 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all group select-none shadow-xs"
        >
          <div className="flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 mb-1">
            <span>
              End {activeTask.title} and start {switchModalData.pendingTitle}
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            The previous task ends and the new task begins at the same recorded transition time.
          </p>
        </button>

        {/* Choice 2: Keep current task running */}
        <button
          onClick={handleCancel}
          className="w-full text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all group select-none shadow-xs"
        >
          <div className="flex items-center justify-between font-bold text-xs text-slate-900 dark:text-white mb-1">
            <span>Keep the current task running</span>
            <RotateCcw className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Cancel starting the new task. You can still create a manually timed entry for a different, non-overlapping period.
          </p>
        </button>
      </div>
    </Modal>
  );
}
