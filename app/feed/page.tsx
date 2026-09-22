"use client";

import React, { useState, useRef } from "react";
import { 
  ThumbsUp,
  Heart, 
  MessageSquare, 
  Share2, 
  Send, 
  Image as ImageIcon, 
  Smile, 
  Paperclip, 
  MoreHorizontal, 
  X,
  Pin, 
  Eye, 
  BarChart2, 
  Sparkles,
  Trash2,
  Globe,
  Search,
  Check,
  Shield,
  Lock,
  EyeOff
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { FeedPost, ReactionType } from "@/types";
import { cn } from "@/lib/utils";

// Facebook Reactions Definitions
const FB_REACTIONS: {
  type: ReactionType;
  label: string;
  emoji: string;
  colorClass: string;
  badgeBg: string;
}[] = [
  { type: "like", label: "Like", emoji: "👍", colorClass: "text-blue-600 dark:text-blue-400", badgeBg: "bg-blue-600" },
  { type: "love", label: "Love", emoji: "❤️", colorClass: "text-rose-600 dark:text-rose-400", badgeBg: "bg-rose-600" },
  { type: "care", label: "Care", emoji: "🥰", colorClass: "text-amber-500", badgeBg: "bg-amber-500" },
  { type: "haha", label: "Haha", emoji: "😆", colorClass: "text-amber-500", badgeBg: "bg-amber-500" },
  { type: "wow", label: "Wow", emoji: "😮", colorClass: "text-amber-500", badgeBg: "bg-amber-500" },
  { type: "sad", label: "Sad", emoji: "😢", colorClass: "text-amber-500", badgeBg: "bg-amber-500" },
  { type: "angry", label: "Angry", emoji: "😡", colorClass: "text-orange-600 dark:text-orange-500", badgeBg: "bg-orange-600" },
];

export default function FeedPage() {
  const { currentUser, posts, createPost, toggleLike, reactToPost, addComment, deletePost, openUserProfile } = useApp();
  const isAdmin = currentUser.role !== "employee";

  const [activeTab, setActiveTab] = useState<"newest" | "suggested" | "my_posts">("newest");
  const [newPostContent, setNewPostContent] = useState("");
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedDept, setSelectedDept] = useState("all");
  const [attachedPhotoUrl, setAttachedPhotoUrl] = useState<string>("");
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const [isComposerModalOpen, setIsComposerModalOpen] = useState(false);
  
  // Facebook Reactions hover dock state
  const [hoveredReactionPostId, setHoveredReactionPostId] = useState<string | null>(null);
  const reactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Comment expansion state
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Truncated post expansion states
  const [expandedTextPostIds, setExpandedTextPostIds] = useState<Record<string, boolean>>({});

  // Insights Modal State
  const [insightsPost, setInsightsPost] = useState<FeedPost | null>(null);

  // Hidden/Dismissed posts in session
  const [hiddenPostIds, setHiddenPostIds] = useState<Record<string, boolean>>({});

  // Sample quick photo templates for team feed
  const samplePhotos = [
    { label: "Team All-Hands", url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80" },
    { label: "Product Roadmap", url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80" },
    { label: "Design Sprint", url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&auto=format&fit=crop&q=80" },
    { label: "Tech Showcase", url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80" },
  ];

  // Colleagues contact list for Right Sidebar (All company team members)
  const onlineContacts = [
    {
      id: "user-sarah",
      name: "Sarah Lin",
      role: "Engineering Lead",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      online: true,
    },
    {
      id: "user-david",
      name: "David Miller",
      role: "HR Director",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      online: true,
    },
    {
      id: "user-elena",
      name: "Elena Rostova",
      role: "Chief Executive Officer",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      online: true,
    },
    {
      id: "user-dinesh",
      name: "Dinesh Perera",
      role: "Product Designer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      online: true,
    },
    {
      id: "user-alex",
      name: "Alex Chen",
      role: "Full Stack Engineer",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      online: true,
    },
    {
      id: "user-nimal",
      name: "Nimal Perera",
      role: "Video Producer & Editor",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      online: false,
    },
    {
      id: "user-marcus",
      name: "Marcus Vance",
      role: "DevOps Engineer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      online: true,
    },
    {
      id: "user-priya",
      name: "Priya Sharma",
      role: "Data Analytics Lead",
      avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80",
      online: true,
    },
    {
      id: "user-kevin",
      name: "Kevin Zhang",
      role: "QA Automation Engineer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      online: false,
    },
    {
      id: "user-rachel",
      name: "Rachel Adams",
      role: "Marketing Specialist",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      online: true,
    },
    {
      id: "user-liam",
      name: "Liam O'Connor",
      role: "Cloud Architect",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      online: true,
    },
  ];

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    if (hiddenPostIds[p.id]) return false;
    if (activeTab === "my_posts") {
      return p.author_id === currentUser.id;
    }
    if (activeTab === "suggested") {
      return p.is_announcement || p.department_name === currentUser.department_name;
    }
    return true;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && !attachedPhotoUrl) return;

    const attachments = attachedPhotoUrl
      ? [
          {
            id: `att-${Date.now()}`,
            file_url: attachedPhotoUrl,
            file_name: "attached-photo.jpg",
            file_type: "image" as const,
          },
        ]
      : [];

    createPost(
      newPostContent,
      attachments,
      isAdmin && !isAnonymous ? isAnnouncement : false,
      selectedDept === "all" || isAnonymous ? undefined : selectedDept,
      isAnonymous
    );

    setNewPostContent("");
    setAttachedPhotoUrl("");
    setShowPhotoInput(false);
    setIsAnnouncement(false);
    setIsAnonymous(false);
    setIsComposerModalOpen(false);
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    addComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  const toggleTextExpansion = (postId: string) => {
    setExpandedTextPostIds((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const dismissPost = (postId: string) => {
    setHiddenPostIds((prev) => ({ ...prev, [postId]: true }));
  };

  const handleMouseEnterLike = (postId: string) => {
    if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
    setHoveredReactionPostId(postId);
  };

  const handleMouseLeaveLike = () => {
    reactionTimeoutRef.current = setTimeout(() => {
      setHoveredReactionPostId(null);
    }, 350);
  };

  return (
    <div className="flex justify-center gap-6 lg:gap-8 max-w-7xl mx-auto">
      {/* ========================================================================= */}
      {/* CENTER COLUMN: COMPOSER & POST STREAM (NO STORIES/REELS, NO VIDEOS)        */}
      {/* ========================================================================= */}
      <div className="flex-1 max-w-[620px] min-w-0 space-y-4">
        {/* Feed Header Filter Bar */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Workplace Feed
          </h2>

          {/* View Switcher Tabs: Newest | Suggested | My Posts */}
          <div className="inline-flex p-0.5 bg-slate-100 dark:bg-[#242526] rounded-xl border border-slate-200/60 dark:border-slate-800">
            {(["newest", "suggested", "my_posts"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-white dark:bg-[#3a3b3c] text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FACEBOOK-STYLE COMPOSER (PHOTOS ONLY, NO VIDEOS, NO STORIES/REELS)       */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-3">
          {/* Top row: Avatar + Pill input */}
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar_url}
              alt={currentUser.first_name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700 shrink-0"
            />
            <button
              type="button"
              onClick={() => setIsComposerModalOpen(true)}
              className="flex-1 text-left px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-slate-500 dark:text-slate-300 rounded-full text-sm font-normal transition-colors cursor-pointer"
            >
              What&apos;s on your mind, {currentUser.first_name}?
            </button>
          </div>

          {/* Bottom row: Photos only (No video buttons) */}
          <div className="flex items-center justify-around pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs font-bold text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => {
                setShowPhotoInput(true);
                setIsComposerModalOpen(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer text-emerald-600 dark:text-emerald-400"
            >
              <ImageIcon className="w-5 h-5 text-emerald-500" />
              <span>Photo</span>
            </button>

            <button
              type="button"
              onClick={() => setIsComposerModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer text-amber-500"
            >
              <Smile className="w-5 h-5 text-amber-500" />
              <span>Feeling/activity</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAnonymous(true);
                setIsComposerModalOpen(true);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer text-purple-600 dark:text-purple-400"
              title="Post anonymously (hide identity from everyone including admin)"
            >
              <Shield className="w-5 h-5 text-purple-500" />
              <span>Anonymous</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setIsAnnouncement(true);
                  setIsComposerModalOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer text-amber-600 dark:text-amber-400"
              >
                <Pin className="w-4 h-4 text-amber-500" />
                <span>Announcement</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* POST STREAM (FACEBOOK POST CARDS WITH COMPLETE FACEBOOK REACTIONS DOCK)   */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isAuthor = !post.is_anonymous && post.author_id === currentUser.id;
            const isExpanded = expandedPostId === post.id;
            const isTextExpanded = !!expandedTextPostIds[post.id];
            const hasAttachments = post.attachments && post.attachments.length > 0;
            const isLongText = post.content.length > 180;
            const currentReaction = post.user_reaction 
              ? FB_REACTIONS.find((r) => r.type === post.user_reaction) 
              : post.has_liked ? FB_REACTIONS[0] : null;

            return (
              <div 
                key={post.id} 
                className={`bg-white dark:bg-[#242526] rounded-2xl shadow-xs border overflow-hidden transition-all ${
                  post.is_anonymous 
                    ? "border-indigo-200/80 dark:border-indigo-900/40" 
                    : "border-slate-200/80 dark:border-slate-800"
                }`}
              >
                {/* Post Header: Author, Time, Public Globe icon, Options (...), Dismiss (X) */}
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {post.is_anonymous ? (
                      <div 
                        className="w-10 h-10 rounded-full bg-linear-to-tr from-slate-800 to-indigo-950 flex items-center justify-center text-white ring-2 ring-indigo-400/40 shrink-0 shadow-xs"
                        title="Identity Protected • Anonymous Colleague"
                      >
                        <Shield className="w-5 h-5 text-indigo-300" />
                      </div>
                    ) : (
                      <img
                        src={post.author_avatar}
                        alt={post.author_name}
                        onClick={() => openUserProfile(post.author_id)}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700 shrink-0 cursor-pointer hover:opacity-90 hover:ring-blue-500 transition-all"
                        title={`View ${post.author_name}'s profile`}
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.is_anonymous ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                              Anonymous Colleague
                            </h4>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/70 dark:border-indigo-800/60">
                              <EyeOff className="w-2.5 h-2.5" />
                              Anonymous Post
                            </span>
                          </div>
                        ) : (
                          <h4
                            onClick={() => openUserProfile(post.author_id)}
                            className="text-sm font-bold text-slate-900 dark:text-white leading-tight hover:underline hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                            title={`View ${post.author_name}'s profile`}
                          >
                            {post.author_name}
                          </h4>
                        )}
                        {post.is_announcement && (
                          <Badge variant="warning" size="sm" className="gap-1">
                            <Pin className="w-2.5 h-2.5" />
                            Announcement
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{post.created_at}</span>
                        <span>•</span>
                        {post.is_anonymous ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                            <Lock className="w-3 h-3" />
                            Identity Protected
                          </span>
                        ) : (
                          <>
                            <Globe className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                            {post.department_name && (
                              <>
                                <span>•</span>
                                <span>{post.department_name}</span>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Options Menu (...) & Close (X) */}
                  <div className="flex items-center gap-1 text-slate-400">
                    {(isAuthor || isAdmin) && (
                      <button
                        onClick={() => deletePost(post.id)}
                        className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 transition-colors"
                        title={isAuthor ? "Delete post" : "Admin: Remove post"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => setInsightsPost(post)}
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#3a3b3c] hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="Post options & insights"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => dismissPost(post.id)}
                      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#3a3b3c] hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="Hide post"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Post Caption / Text */}
                <div className="px-4 pb-3">
                  <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                    {isLongText && !isTextExpanded 
                      ? `${post.content.slice(0, 180)}... ` 
                      : post.content}
                    {isLongText && (
                      <button
                        onClick={() => toggleTextExpansion(post.id)}
                        className="font-bold text-slate-500 dark:text-slate-400 hover:underline inline ml-1"
                      >
                        {isTextExpanded ? "See less" : "See more"}
                      </button>
                    )}
                  </p>
                </div>

                {/* Post Photo Attachment (Photos only, edge-to-edge) */}
                {hasAttachments && post.attachments.map((att) => (
                  <div key={att.id} className="relative w-full bg-slate-950 overflow-hidden">
                    <img
                      src={att.file_url}
                      alt={att.file_name}
                      className="w-full max-h-[500px] object-cover hover:opacity-95 transition-opacity cursor-pointer"
                      onClick={() => window.open(att.file_url, "_blank")}
                    />
                  </div>
                ))}

                {/* Author-only Post Insights Bar */}
                {isAuthor && (
                  <div className="mx-4 my-2 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#3a3b3c]/60 border border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-medium">
                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                        {post.impressions_count} Impressions
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="flex items-center gap-1 font-medium">
                        <BarChart2 className="w-3.5 h-3.5 text-emerald-500" />
                        {post.reach_count} Reach
                      </span>
                    </div>
                    <button
                      onClick={() => setInsightsPost(post)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Insights
                    </button>
                  </div>
                )}

                {/* Engagement Statistics Row (Facebook Reactions Badges + counts) */}
                <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-1.5">
                    {/* Dynamic Overlapping Reaction Badges */}
                    <div className="flex items-center -space-x-1">
                      {currentReaction ? (
                        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-xs ring-1 ring-white dark:ring-[#242526]")}>
                          <span>{currentReaction.emoji}</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white ring-1 ring-white dark:ring-[#242526]">
                            <ThumbsUp className="w-2.5 h-2.5 fill-white" />
                          </div>
                          <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-white ring-1 ring-white dark:ring-[#242526]">
                            <Heart className="w-2.5 h-2.5 fill-white" />
                          </div>
                        </>
                      )}
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {post.likes_count}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-medium">
                    <button 
                      onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                      className="hover:underline"
                    >
                      {post.comments_count} comments
                    </button>
                    <span>•</span>
                    <span>2 shares</span>
                  </div>
                </div>

                {/* ================================================================= */}
                {/* FACEBOOK ACTION BAR WITH FLOATING REACTIONS DOCK (EXACT FB UX)    */}
                {/* ================================================================= */}
                <div className="relative px-2 py-1 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                  {/* Floating Facebook Reactions Dock */}
                  {hoveredReactionPostId === post.id && (
                    <div 
                      className="absolute -top-12 left-2 z-40 flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#242526] rounded-full shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150"
                      onMouseEnter={() => {
                        if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
                      }}
                      onMouseLeave={handleMouseLeaveLike}
                    >
                      {FB_REACTIONS.map((r) => (
                        <button
                          key={r.type}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            reactToPost(post.id, r.type);
                            setHoveredReactionPostId(null);
                          }}
                          className="text-2xl hover:scale-135 -translate-y-0 hover:-translate-y-1 transition-all duration-150 p-1 cursor-pointer relative group/reaction"
                          title={r.label}
                        >
                          <span>{r.emoji}</span>
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900/90 text-white text-[10px] font-bold opacity-0 group-hover/reaction:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
                            {r.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Reaction Button (Direct click toggles reaction, hover opens dock) */}
                  <div 
                    className="relative flex-1"
                    onMouseEnter={() => handleMouseEnterLike(post.id)}
                    onMouseLeave={handleMouseLeaveLike}
                  >
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 py-2 rounded-xl transition-colors cursor-pointer",
                        currentReaction
                          ? cn(currentReaction.colorClass, "bg-slate-100/60 dark:bg-[#3a3b3c]/60")
                          : "hover:bg-slate-100 dark:hover:bg-[#3a3b3c]"
                      )}
                    >
                      {currentReaction ? (
                        <>
                          <span className="text-base">{currentReaction.emoji}</span>
                          <span className="font-extrabold">{currentReaction.label}</span>
                        </>
                      ) : (
                        <>
                          <ThumbsUp className="w-4 h-4" />
                          <span>Like</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Comment Button */}
                  <button
                    onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Comment</span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: post.author_name, text: post.content });
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>

                {/* Comments Section */}
                {isExpanded && (
                  <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700/60 space-y-3 bg-slate-50/50 dark:bg-[#1f2021]/50 animate-in fade-in">
                    {/* Comments List */}
                    <div className="space-y-2.5">
                      {post.comments.map((comm) => (
                        <div key={comm.id} className="flex items-start gap-2.5 text-xs">
                          <img
                            src={comm.author_avatar}
                            alt={comm.author_name}
                            onClick={() => openUserProfile(comm.author_id)}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0 mt-0.5 cursor-pointer hover:opacity-90 hover:ring-blue-500 transition-all"
                            title={`View ${comm.author_name}'s profile`}
                          />
                          <div className="flex-1 bg-white dark:bg-[#3a3b3c] p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span
                                onClick={() => openUserProfile(comm.author_id)}
                                className="font-bold text-slate-900 dark:text-white hover:underline hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                                title={`View ${comm.author_name}'s profile`}
                              >
                                {comm.author_name}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-400">
                                {comm.created_at}
                              </span>
                            </div>
                            <p className="text-slate-800 dark:text-slate-200 mt-1">
                              {comm.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Facebook Pill Comment Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <img
                        src={currentUser.avatar_url}
                        alt={currentUser.first_name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 flex items-center bg-white dark:bg-[#3a3b3c] border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 shadow-2xs">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCommentSubmit(post.id);
                          }}
                          placeholder="Write a comment..."
                          className="flex-1 bg-transparent text-slate-900 dark:text-white text-xs focus:outline-none"
                        />
                        <button
                          onClick={() => handleCommentSubmit(post.id)}
                          className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 disabled:opacity-40 cursor-pointer"
                          disabled={!commentInputs[post.id]?.trim()}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredPosts.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-[#242526] rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">No posts in this view</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Share a photo update or switch filters to view more workplace activity.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: WORKPLACE CONTACTS                                          */}
      {/* ========================================================================= */}
      <aside className="hidden xl:block w-80 shrink-0 space-y-4 sticky top-16 self-start select-none">
        {/* Contacts Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Contacts
            </h3>
            <div className="flex items-center gap-1 text-slate-400">
              <button className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-[#242526] hover:text-slate-600 dark:hover:text-slate-200">
                <Search className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-[#242526] hover:text-slate-600 dark:hover:text-slate-200">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {onlineContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => openUserProfile(contact.id)}
                className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#242526] transition-colors cursor-pointer group"
                title={`Click to view ${contact.name}'s Facebook profile`}
              >
                <div className="relative">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 group-hover:ring-blue-500 transition-all"
                  />
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#18191a]" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {contact.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    {contact.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MODAL: CREATE POST DIALOG (PHOTOS ONLY, NO VIDEOS)                        */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isComposerModalOpen}
        onClose={() => setIsComposerModalOpen(false)}
        title="Create post"
        maxWidth="md"
      >
        <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
          {/* Anonymity Mode Toggle Banner */}
          <div className={`p-3 rounded-2xl border transition-all ${
            isAnonymous 
              ? "bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80" 
              : "bg-slate-50 dark:bg-[#3a3b3c]/40 border-slate-200/80 dark:border-slate-700/60"
          }`}>
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 font-bold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  Post Anonymously
                </span>
              </label>
              {isAnonymous && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                  🔒 Identity Protected
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-6 leading-relaxed">
              {isAnonymous 
                ? "Your real identity, avatar, and department are completely scrubbed. Neither colleagues, managers, HR admins, nor the company owner can see who posted this."
                : "Toggle on to share ideas, feedback, or questions completely anonymously with your workplace."}
            </p>
          </div>

          {/* Author info & Audience dropdown */}
          <div className="flex items-center gap-3">
            {isAnonymous ? (
              <div 
                className="w-10 h-10 rounded-full bg-linear-to-tr from-slate-800 to-indigo-950 flex items-center justify-center text-white ring-2 ring-indigo-500/50 shrink-0 shadow-xs"
                title="Identity Protected • Anonymous Colleague"
              >
                <Shield className="w-5 h-5 text-indigo-300" />
              </div>
            ) : (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.first_name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
              />
            )}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                {isAnonymous ? (
                  <>
                    <span>Anonymous Colleague</span>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                      (Identity Scrubbed)
                    </span>
                  </>
                ) : (
                  `${currentUser.first_name} ${currentUser.last_name}`
                )}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {!isAnonymous ? (
                  <>
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="bg-slate-100 dark:bg-[#3a3b3c] border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 text-slate-700 dark:text-slate-200 text-[11px] font-medium focus:outline-none"
                    >
                      <option value="all">Entire Company</option>
                      <option value="Engineering">Engineering Only</option>
                      <option value="Design">Product & Design</option>
                      <option value="HR">Human Resources</option>
                    </select>

                    {isAdmin && (
                      <label className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAnnouncement}
                          onChange={(e) => setIsAnnouncement(e.target.checked)}
                          className="rounded text-amber-600 focus:ring-amber-500 w-3 h-3"
                        />
                        <span>Announcement</span>
                      </label>
                    )}
                  </>
                ) : (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400" />
                    Shared with workplace anonymously
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder={
              isAnonymous 
                ? "Share your honest thoughts, ideas, or questions completely anonymously (no one will ever know who posted this)..."
                : `What's on your mind, ${currentUser.first_name}?`
            }
            rows={4}
            autoFocus
            className="w-full text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent border-none focus:outline-none resize-none"
          />

          {/* Attached Photo Live Preview */}
          {attachedPhotoUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 max-h-60">
              <img
                src={attachedPhotoUrl}
                alt="Attached preview"
                className="w-full h-full object-cover max-h-60"
              />
              <button
                type="button"
                onClick={() => setAttachedPhotoUrl("")}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Photo URL or Quick Select Box */}
          {showPhotoInput && !attachedPhotoUrl && (
            <div className="p-3 bg-slate-50 dark:bg-[#3a3b3c]/70 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  Attach Photo
                </span>
                <button
                  type="button"
                  onClick={() => setShowPhotoInput(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                type="url"
                placeholder="Paste image URL (https://...)"
                value={attachedPhotoUrl}
                onChange={(e) => setAttachedPhotoUrl(e.target.value)}
                className="w-full bg-white dark:bg-[#242526] text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
                  Or pick a workplace sample photo:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {samplePhotos.map((photo) => (
                    <button
                      key={photo.label}
                      type="button"
                      onClick={() => setAttachedPhotoUrl(photo.url)}
                      className="text-left px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#242526] hover:border-blue-400 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors truncate cursor-pointer"
                    >
                      📷 {photo.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Add to your post bar (Photos only, emojis, files) */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#3a3b3c]/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Add to your post
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPhotoInput(!showPhotoInput)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#4e4f50] text-emerald-500 transition-colors cursor-pointer"
                title="Add photo"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#4e4f50] text-amber-500 transition-colors"
                title="Feeling/activity"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowPhotoInput(true)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#4e4f50] text-blue-500 transition-colors"
                title="Attach photo URL"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Submit Post Button */}
          <Button
            type="submit"
            disabled={!newPostContent.trim() && !attachedPhotoUrl}
            className={`w-full h-10 font-bold text-white rounded-xl shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 transition-all ${
              isAnonymous 
                ? "bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isAnonymous ? (
              <>
                <Shield className="w-4 h-4" />
                <span>Post Anonymously</span>
              </>
            ) : (
              "Post"
            )}
          </Button>
        </form>
      </Modal>

      {/* Post Insights Modal */}
      <Modal
        isOpen={!!insightsPost}
        onClose={() => setInsightsPost(null)}
        title="Post Engagement & Reach Insights"
        description="Detailed visibility analytics for your published post."
      >
        {insightsPost && (
          <div className="space-y-4 text-xs">
            {insightsPost.is_anonymous && (
              <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-indigo-950 dark:text-indigo-200 leading-relaxed">
                  <span className="font-bold">Protected Anonymous Post:</span> The author's identity was completely scrubbed at creation time. Neither team members, managers, HR administrators, nor the company owner can trace this post to an account.
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/60">
                <p className="text-slate-500 dark:text-slate-400">Total Impressions</p>
                <h4 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-1">
                  {insightsPost.impressions_count}
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">
                  Card viewed for at least 1.0 second in viewport
                </p>
              </div>

              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                <p className="text-slate-500 dark:text-slate-400">Unique Reach</p>
                <h4 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                  {insightsPost.reach_count}
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">
                  Distinct workplace colleagues
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/60 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-300">Reactions:</span>
                <span className="font-bold text-slate-900 dark:text-white">{insightsPost.likes_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-300">Comments:</span>
                <span className="font-bold text-slate-900 dark:text-white">{insightsPost.comments_count}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
              Note: Social metrics are for internal communication and are never used as a proxy for employee work performance.
            </p>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setInsightsPost(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
