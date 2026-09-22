"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { FacebookProfileContent } from "@/components/profile/FacebookProfileContent";
import { ArrowLeft, UserX, Home } from "lucide-react";

export default function UserProfilePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { allEmployees, currentUser } = useApp();

  const decodedId = decodeURIComponent(id || "").toLowerCase();

  // Find user by ID, employee_id, email or name
  const user =
    allEmployees.find(
      (u) =>
        u.id.toLowerCase() === decodedId ||
        u.employee_id.toLowerCase() === decodedId ||
        u.email.toLowerCase() === decodedId ||
        `${u.first_name} ${u.last_name}`.toLowerCase() === decodedId ||
        u.first_name.toLowerCase() === decodedId
    ) ||
    (currentUser.id.toLowerCase() === decodedId ? currentUser : null);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <UserX className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Team Member Profile Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The requested employee profile does not exist or may have been updated.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors"
          >
            Go Back
          </button>
          <Link
            href="/feed"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Feed</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-16">
      {/* Top Navigation Bar with Back Button */}
      <div className="max-w-6xl mx-auto mb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#242526] hover:bg-slate-100 dark:hover:bg-[#3a3b3c] border border-slate-200/80 dark:border-[#3a3b3c] text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <Link
          href="/feed"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#242526] hover:bg-slate-100 dark:hover:bg-[#3a3b3c] border border-slate-200/80 dark:border-[#3a3b3c] text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-xs"
        >
          <Home className="w-3.5 h-3.5 text-blue-500" />
          <span>Workplace Feed</span>
        </Link>
      </div>

      {/* Main Facebook Profile Card */}
      <div className="rounded-3xl overflow-hidden border border-slate-200/80 dark:border-[#3a3b3c] shadow-lg bg-white dark:bg-[#242526]">
        <FacebookProfileContent user={user} isModal={false} />
      </div>
    </div>
  );
}

