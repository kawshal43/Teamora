"use client";

import React, { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { FacebookProfileContent } from "./FacebookProfileContent";

export function UserProfileModal() {
  const { selectedProfileUser, closeUserProfile } = useApp();

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeUserProfile();
      }
    };

    if (selectedProfileUser) {
      window.addEventListener("keydown", handleKeyDown);
      // Lock body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedProfileUser, closeUserProfile]);

  if (!selectedProfileUser) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs transition-opacity duration-200"
      onClick={closeUserProfile}
    >
      <div
        className="relative w-full max-w-5xl my-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-300/60 dark:border-[#3a3b3c] bg-[#f0f2f5] dark:bg-[#18191a] max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <FacebookProfileContent
            user={selectedProfileUser}
            isModal={true}
            onClose={closeUserProfile}
          />
        </div>
      </div>
    </div>
  );
}

