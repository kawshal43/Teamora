"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserProfile, FeedPost, Task, ReactionType } from "@/types";
import { useApp } from "@/context/AppContext";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  Award,
  Sparkles,
  ExternalLink,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Share2,
  MessageCircle,
  ThumbsUp,
  Heart,
  Smile,
  Copy,
  Check,
  CheckSquare,
  Shield,
  UserCheck
} from "lucide-react";

interface FacebookProfileContentProps {
  user: UserProfile;
  isModal?: boolean;
  onClose?: () => void;
}

export function FacebookProfileContent({
  user,
  isModal = false,
  onClose
}: FacebookProfileContentProps) {
  const {
    currentUser,
    allEmployees,
    openUserProfile,
    posts,
    tasks,
    reactToPost,
    toggleLike,
    addComment,
    setIsCreateTaskModalOpen
  } = useApp();

  const [activeTab, setActiveTab] = useState<"posts" | "about" | "tasks">("posts");
  const [aboutSubCategory, setAboutSubCategory] = useState<"overview" | "work" | "contact" | "skills">("overview");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>("all");
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [hoveredReactionPostId, setHoveredReactionPostId] = useState<string | null>(null);

  const isSelf = currentUser.id === user.id;

  // Filter posts written by or associated with this user (excluding anonymous posts to preserve strict privacy)
  const userPosts = posts.filter(
    (p) =>
      !p.is_anonymous &&
      (p.author_id === user.id ||
       p.author_name.toLowerCase() === `${user.first_name} ${user.last_name}`.toLowerCase())
  );

  // Filter tasks assigned to this user
  const userTasks = tasks.filter(
    (t) =>
      t.assigned_to === user.id ||
      t.assigned_to_name.toLowerCase() === `${user.first_name} ${user.last_name}`.toLowerCase()
  );

  const filteredTasks = userTasks.filter((t) => {
    if (taskStatusFilter === "all") return true;
    return t.status === taskStatusFilter;
  });

  // Team colleagues (other employees from same department or company)
  const colleagues = allEmployees.filter((e) => e.id !== user.id);

  const copyToClipboard = (text: string, type: "email" | "link") => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === "email") {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return {
          label: "Company Owner",
          className: "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
        };
      case "hr_admin":
        return {
          label: "HR Director",
          className: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
        };
      case "sub_admin":
        return {
          label: "Sub Admin",
          className: "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
        };
      default:
        return {
          label: "Team Member",
          className: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
        };
    }
  };

  const roleBadge = getRoleBadge(user.role);

  // Formatted join date
  const formattedJoinDate = user.joined_date
    ? new Date(user.joined_date).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
      })
    : "January 2024";

  return (
    <div className="w-full bg-[#f0f2f5] dark:bg-[#18191a] text-slate-900 dark:text-[#e4e6eb] transition-colors duration-200">
      {/* ===================================================================== */}
      {/* 1. COVER PHOTO BANNER                                                 */}
      {/* ===================================================================== */}
      <div className="relative w-full bg-slate-900 overflow-hidden group">
        <div className="h-48 sm:h-64 md:h-80 w-full relative">
          <img
            src={
              user.cover_url ||
              "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1400&auto=format&fit=crop&q=80"
            }
            alt={`${user.first_name} cover banner`}
            className="w-full h-full object-cover select-none"
          />
          {/* Subtle gradient darkening at bottom to merge with FB profile bar */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Close button if rendered inside modal */}
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg hover:scale-105"
              aria-label="Close Profile"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Department Watermark Tag on Cover */}
          <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>{user.department_name || "Teamora"}</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. FACEBOOK PROFILE HEADER (AVATAR, NAME, ACTIONS, & TABS)           */}
      {/* ===================================================================== */}
      <div className="bg-white dark:bg-[#242526] border-b border-slate-200 dark:border-[#3a3b3c] px-4 sm:px-8 shadow-xs">
        <div className="max-w-6xl mx-auto">
          {/* Top Row: Overlapping Avatar + Info + Action Buttons */}
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 -mt-16 sm:-mt-20 pb-5">
            {/* Left: Avatar & Text */}
            <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left">
              {/* Circular Avatar with Online Presence */}
              <div className="relative shrink-0">
                <img
                  src={
                    user.avatar_url ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                  }
                  alt={`${user.first_name} ${user.last_name}`}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover ring-4 ring-white dark:ring-[#242526] shadow-xl bg-slate-100 dark:bg-slate-800"
                />
                {user.is_active && (
                  <span
                    className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-[#242526] shadow-md"
                    title="Active Now"
                  />
                )}
              </div>

              {/* Name, Designation, Badges */}
              <div className="space-y-1.5 pb-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {user.first_name} {user.last_name}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadge.className}`}
                  >
                    <Shield className="w-3 h-3" />
                    {roleBadge.label}
                  </span>
                </div>

                <p className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                  {user.designation}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {user.department_name || "Engineering"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {user.location || "Remote / HQ"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    ID: {user.employee_id}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 md:pt-0">
              {/* Send Email Action */}
              <a
                href={`mailto:${user.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02]"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </a>

              {/* Assign / Give Task Action */}
              <button
                onClick={() => {
                  if (isModal && onClose) onClose();
                  setIsCreateTaskModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-slate-800 dark:text-white text-xs font-bold transition-all"
              >
                <CheckSquare className="w-4 h-4 text-blue-500" />
                <span>Give Task</span>
              </button>

              {/* Copy Profile Link */}
              <button
                onClick={() =>
                  copyToClipboard(
                    typeof window !== "undefined"
                      ? `${window.location.origin}/profile/${user.id}`
                      : `/profile/${user.id}`,
                    "link"
                  )
                }
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-slate-700 dark:text-slate-200 transition-all"
                title="Copy Profile Link"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>

              {/* Standalone Route Link if inside Modal */}
              {isModal && (
                <Link
                  href={`/profile/${user.id}`}
                  onClick={() => onClose && onClose()}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-slate-700 dark:text-slate-200 transition-all"
                  title="Open Full Page View"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Bottom Row: Facebook Style Tab Navigation */}
          <div className="flex items-center gap-1 sm:gap-2 border-t border-slate-100 dark:border-[#3a3b3c] pt-1">
            <button
              onClick={() => setActiveTab("posts")}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-3 transition-colors flex items-center gap-2 ${
                activeTab === "posts"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] rounded-t-lg"
              }`}
            >
              <span>Posts</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-[#3a3b3c] text-[10px] font-semibold">
                {userPosts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("about")}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-3 transition-colors flex items-center gap-2 ${
                activeTab === "about"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] rounded-t-lg"
              }`}
            >
              <span>About</span>
            </button>

            <button
              onClick={() => setActiveTab("tasks")}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-3 transition-colors flex items-center gap-2 ${
                activeTab === "tasks"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] rounded-t-lg"
              }`}
            >
              <span>Assigned Tasks</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-[#3a3b3c] text-[10px] font-semibold">
                {userTasks.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. MAIN CONTENT BODY ACCORDING TO ACTIVE TAB                          */}
      {/* ===================================================================== */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
        {/* ================================================================= */}
        {/* TAB 1: POSTS & TIMELINE (2-COLUMN FACEBOOK DESKTOP LAYOUT)         */}
        {/* ================================================================= */}
        {activeTab === "posts" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (4 cols): Intro, Skills, Teammates */}
            <div className="lg:col-span-5 space-y-4">
              {/* Intro Card */}
              <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#3a3b3c] shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Intro
                </h3>

                {/* Bio text */}
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic border-l-3 border-blue-500 pl-3 py-1">
                  "{user.bio || "Passionate team contributor driving excellence at Teamora."}"
                </div>

                <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Works as <strong className="text-slate-900 dark:text-white">{user.designation}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Department: <strong className="text-slate-900 dark:text-white">{user.department_name || "Engineering"}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Lives in <strong className="text-slate-900 dark:text-white">{user.location || "San Francisco, CA"}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Joined Teamora on <strong className="text-slate-900 dark:text-white">{formattedJoinDate}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Employee Code: <code className="bg-slate-100 dark:bg-[#3a3b3c] px-2 py-0.5 rounded font-mono font-bold text-xs">{user.employee_id}</code>
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills & Competencies Card */}
              {user.skills && user.skills.length > 0 && (
                <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#3a3b3c] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Skills & Core Expertise</span>
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {user.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/60 text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Department Colleagues Grid Card */}
              <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#3a3b3c] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Team Colleagues
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {colleagues.length} members at Teamora
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {colleagues.slice(0, 6).map((colleague) => (
                    <button
                      key={colleague.id}
                      onClick={() => openUserProfile(colleague)}
                      className="flex flex-col items-center p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-all text-center group"
                    >
                      <img
                        src={colleague.avatar_url}
                        alt={colleague.first_name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-blue-500 transition-all shadow-xs"
                      />
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-1.5 truncate w-full group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {colleague.first_name}
                      </p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate w-full">
                        {colleague.designation}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (7 cols): Feed Posts Timeline */}
            <div className="lg:col-span-7 space-y-4">
              {/* Posts Header Filter Bar */}
              <div className="bg-white dark:bg-[#242526] rounded-2xl px-5 py-3 border border-slate-200/80 dark:border-[#3a3b3c] shadow-xs flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Posts Timeline
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {userPosts.length} {userPosts.length === 1 ? "post" : "posts"} shared
                </span>
              </div>

              {/* Feed Posts List */}
              {userPosts.length > 0 ? (
                userPosts.map((post) => {
                  const hasPhoto = post.attachments && post.attachments.length > 0;
                  const isCommentsOpen = expandedCommentsPostId === post.id;

                  return (
                    <article
                      key={post.id}
                      className="bg-white dark:bg-[#242526] rounded-2xl border border-slate-200/80 dark:border-[#3a3b3c] shadow-xs overflow-hidden"
                    >
                      {/* Post Author Header */}
                      <div className="p-4 sm:p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.author_avatar || user.avatar_url}
                            alt={post.author_name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {post.author_name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span>{post.created_at}</span>
                              <span>•</span>
                              <span>{post.author_designation || user.designation}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Post Content Text */}
                      <div className="px-4 sm:px-5 pb-3">
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-[#e4e6eb] whitespace-pre-line leading-relaxed">
                          {post.content}
                        </p>
                      </div>

                      {/* Post Photo Attachment (if any) */}
                      {hasPhoto && (
                        <div className="w-full max-h-96 bg-black overflow-hidden flex items-center justify-center">
                          <img
                            src={post.attachments[0].file_url}
                            alt={post.attachments[0].file_name || "Post image"}
                            className="w-full h-full object-cover max-h-96"
                          />
                        </div>
                      )}

                      {/* Reactions & Comments Metric Counters */}
                      <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between border-b border-slate-100 dark:border-[#3a3b3c] text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                            <ThumbsUp className="w-3 h-3 fill-white" />
                          </span>
                          <span className="w-5 h-5 rounded-full bg-red-500 -ml-2.5 flex items-center justify-center text-white">
                            <Heart className="w-3 h-3 fill-white" />
                          </span>
                          <span className="font-semibold ml-1">
                            {post.likes_count || 1}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setExpandedCommentsPostId(
                              isCommentsOpen ? null : post.id
                            )
                          }
                          className="hover:underline"
                        >
                          {post.comments ? post.comments.length : 0} comments
                        </button>
                      </div>

                      {/* Facebook Action Buttons (Like, Comment, Share) */}
                      <div className="px-2 py-1 flex items-center justify-around text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors ${
                            post.has_liked
                              ? "text-blue-600 dark:text-blue-400 font-bold"
                              : ""
                          }`}
                        >
                          <ThumbsUp
                            className={`w-4 h-4 ${
                              post.has_liked ? "fill-blue-600" : ""
                            }`}
                          />
                          <span>Like</span>
                        </button>

                        <button
                          onClick={() =>
                            setExpandedCommentsPostId(
                              isCommentsOpen ? null : post.id
                            )
                          }
                          className="flex-1 py-2 flex items-center justify-center gap-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Comment</span>
                        </button>

                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${window.location.origin}/feed`,
                              "link"
                            )
                          }
                          className="flex-1 py-2 flex items-center justify-center gap-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </button>
                      </div>

                      {/* Expandable Comments Drawer */}
                      {isCommentsOpen && (
                        <div className="p-4 bg-slate-50 dark:bg-[#1e1f20] border-t border-slate-100 dark:border-[#3a3b3c] space-y-3">
                          {/* Comments List */}
                          {post.comments && post.comments.length > 0 && (
                            <div className="space-y-2">
                              {post.comments.map((comm) => (
                                <div
                                  key={comm.id}
                                  className="flex items-start gap-2.5"
                                >
                                  <img
                                    src={
                                      comm.author_avatar ||
                                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                                    }
                                    alt={comm.author_name}
                                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                                  />
                                  <div className="bg-white dark:bg-[#2b2d2e] rounded-2xl px-3.5 py-2 text-xs shadow-2xs max-w-[85%]">
                                    <p className="font-bold text-slate-900 dark:text-white">
                                      {comm.author_name}
                                    </p>
                                    <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                                      {comm.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* New Comment Input */}
                          <div className="flex items-center gap-2 pt-1">
                            <img
                              src={currentUser.avatar_url}
                              alt={currentUser.first_name}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                            <div className="flex-1 flex items-center bg-white dark:bg-[#2b2d2e] rounded-full px-3 py-1.5 border border-slate-200 dark:border-slate-700">
                              <input
                                type="text"
                                placeholder={`Write a comment to ${user.first_name}...`}
                                value={commentInput[post.id] || ""}
                                onChange={(e) =>
                                  setCommentInput((prev) => ({
                                    ...prev,
                                    [post.id]: e.target.value
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    (commentInput[post.id] || "").trim()
                                  ) {
                                    addComment(
                                      post.id,
                                      commentInput[post.id].trim()
                                    );
                                    setCommentInput((prev) => ({
                                      ...prev,
                                      [post.id]: ""
                                    }));
                                  }
                                }}
                                className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-hidden"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })
              ) : (
                /* Friendly empty state when user hasn't posted yet */
                <div className="bg-white dark:bg-[#242526] rounded-2xl p-8 border border-slate-200/80 dark:border-[#3a3b3c] shadow-xs text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    No posts shared yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    When {user.first_name} posts company updates, announcements, or photo moments, they will appear here on their Facebook profile timeline.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: ABOUT SECTION (FACEBOOK DETAILED CATEGORIES)                */}
        {/* ================================================================= */}
        {activeTab === "about" && (
          <div className="bg-white dark:bg-[#242526] rounded-2xl border border-slate-200/80 dark:border-[#3a3b3c] shadow-xs overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
              {/* About Subcategory Navigation (Left Column) */}
              <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#3a3b3c] p-4 space-y-1">
                <h3 className="text-base font-black px-3 py-2 text-slate-900 dark:text-white">
                  About
                </h3>
                <button
                  onClick={() => setAboutSubCategory("overview")}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2.5 ${
                    aboutSubCategory === "overview"
                      ? "bg-blue-50 dark:bg-[#3a3b3c] text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#323436]"
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setAboutSubCategory("work")}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2.5 ${
                    aboutSubCategory === "work"
                      ? "bg-blue-50 dark:bg-[#3a3b3c] text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#323436]"
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Work & Education</span>
                </button>

                <button
                  onClick={() => setAboutSubCategory("contact")}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2.5 ${
                    aboutSubCategory === "contact"
                      ? "bg-blue-50 dark:bg-[#3a3b3c] text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#323436]"
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact & Basic Info</span>
                </button>

                <button
                  onClick={() => setAboutSubCategory("skills")}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2.5 ${
                    aboutSubCategory === "skills"
                      ? "bg-blue-50 dark:bg-[#3a3b3c] text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#323436]"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Skills & Competencies</span>
                </button>
              </div>

              {/* About Category Details (Right Column) */}
              <div className="md:col-span-8 p-6 space-y-6">
                {aboutSubCategory === "overview" && (
                  <div className="space-y-4">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Profile Overview
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {user.bio || "Member of the Teamora internal workforce."}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1e1f20] border border-slate-100 dark:border-[#3a3b3c] space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Designation
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {user.designation}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1e1f20] border border-slate-100 dark:border-[#3a3b3c] space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Department
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {user.department_name || "Engineering"}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1e1f20] border border-slate-100 dark:border-[#3a3b3c] space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Employee Code
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                          {user.employee_id}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1e1f20] border border-slate-100 dark:border-[#3a3b3c] space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          System Role
                        </span>
                        <p className="text-sm font-bold capitalize text-slate-900 dark:text-white">
                          {user.role.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {aboutSubCategory === "work" && (
                  <div className="space-y-4">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Work Experience & Department
                    </h4>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#1e1f20] border border-slate-100 dark:border-[#3a3b3c]">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                          {user.designation} at Teamora
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {user.department_name || "Engineering"} • Full-time
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Joined {formattedJoinDate} • Present
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#1e1f20] border border-slate-100 dark:border-[#3a3b3c]">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                          Professional Standing
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Active team member in good standing with valid attendance and task tracking records.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {aboutSubCategory === "contact" && (
                  <div className="space-y-4">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Contact & Basic Information
                    </h4>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#1e1f20] border border-slate-100 dark:border-[#3a3b3c]">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                              Work Email
                            </p>
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(user.email, "email")}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#3a3b3c] border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#4e4f50] transition-colors flex items-center gap-1.5"
                        >
                          {copiedEmail ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {user.phone && (
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#1e1f20] border border-slate-100 dark:border-[#3a3b3c]">
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">
                                Phone Number
                              </p>
                              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                                {user.phone}
                              </p>
                            </div>
                          </div>
                          <a
                            href={`tel:${user.phone}`}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </a>
                        </div>
                      )}

                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#1e1f20] border border-slate-100 dark:border-[#3a3b3c]">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            Location
                          </p>
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                            {user.location || "San Francisco, CA"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {aboutSubCategory === "skills" && (
                  <div className="space-y-4">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      Verified Skills & Capabilities
                    </h4>

                    {user.skills && user.skills.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {user.skills.map((skill, index) => (
                          <div
                            key={skill}
                            className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1e1f20] border border-slate-100 dark:border-[#3a3b3c] flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                {skill}
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400">
                              Verified
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        No specific skills registered yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: ASSIGNED TASKS                                             */}
        {/* ================================================================= */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            {/* Task Controls Header */}
            <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#3a3b3c] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Assigned Workplace Tasks
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {userTasks.length} total tasks assigned to {user.first_name}
                </p>
              </div>

              {/* Status Filter Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {["all", "todo", "in_progress", "completed"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTaskStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                      taskStatusFilter === st
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-[#3a3b3c] text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}

                <button
                  onClick={() => {
                    if (isModal && onClose) onClose();
                    setIsCreateTaskModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign New</span>
                </button>
              </div>
            </div>

            {/* Tasks Cards Grid */}
            {filteredTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTasks.map((t) => {
                  const isCompleted = t.status === "completed";
                  const isInProgress = t.status === "in_progress";

                  return (
                    <div
                      key={t.id}
                      className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-[#3a3b3c] shadow-xs space-y-3 hover:border-blue-400/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4
                            className={`text-sm font-bold ${
                              isCompleted
                                ? "line-through text-slate-400 dark:text-slate-500"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {t.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {t.description || "No specific instructions provided."}
                          </p>
                        </div>

                        {/* Priority Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase shrink-0 ${
                            t.priority === "urgent"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                              : t.priority === "high"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                              : "bg-slate-100 text-slate-600 dark:bg-[#3a3b3c] dark:text-slate-300"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>

                      {/* Footer: Due date + Status Pill */}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-[#3a3b3c]">
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{t.due_date}</span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : isInProgress
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                              : "bg-slate-100 text-slate-600 dark:bg-[#3a3b3c] dark:text-slate-300"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {t.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#242526] rounded-2xl p-8 border border-slate-200/80 dark:border-[#3a3b3c] shadow-xs text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  No tasks matching "{taskStatusFilter}"
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {user.first_name} is all caught up or no tasks have been created under this filter.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

