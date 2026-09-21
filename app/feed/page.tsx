"use client";

import React, { useState } from "react";
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Send, 
  Image as ImageIcon, 
  Smile, 
  Paperclip, 
  MoreHorizontal, 
  Pin, 
  Eye, 
  BarChart2, 
  Sparkles,
  ShieldAlert,
  Trash2
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { FeedPost } from "@/types";

export default function FeedPage() {
  const { currentUser, posts, createPost, toggleLike, addComment, deletePost } = useApp();
  const isAdmin = currentUser.role !== "employee";

  const [activeTab, setActiveTab] = useState<"newest" | "suggested" | "my_posts">("newest");
  const [newPostContent, setNewPostContent] = useState("");
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [selectedDept, setSelectedDept] = useState("all");
  
  // Comment expansion state
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Insights Modal State
  const [insightsPost, setInsightsPost] = useState<FeedPost | null>(null);

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    if (activeTab === "my_posts") {
      return p.author_id === currentUser.id;
    }
    if (activeTab === "suggested") {
      // Suggested: prioritize department or announcements
      return p.is_announcement || p.department_name === currentUser.department_name;
    }
    return true; // Newest: all
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    createPost(
      newPostContent,
      [],
      isAdmin ? isAnnouncement : false,
      selectedDept === "all" ? undefined : selectedDept
    );

    setNewPostContent("");
    setIsAnnouncement(false);
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    addComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Workplace Feed</h2>
          <p className="text-xs text-slate-500">
            Internal social network, updates, and company announcements.
          </p>
        </div>

        {/* View Switcher Tabs: Newest | Suggested | My Posts */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl">
          {(["newest", "suggested", "my_posts"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Post Creator Box */}
      <Card className="p-5">
        <form onSubmit={handleCreatePost} className="space-y-3">
          <div className="flex items-start gap-3">
            <img
              src={currentUser.avatar_url}
              alt={currentUser.first_name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 mt-0.5"
            />
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={`What are you working on today, ${currentUser.first_name}?`}
                rows={3}
                className="w-full text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/70 rounded-xl p-3 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Admin Specific Posting Options */}
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isAnnouncement}
                  onChange={(e) => setIsAnnouncement(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="flex items-center gap-1 text-amber-700 font-semibold">
                  <Pin className="w-3.5 h-3.5" />
                  Official Announcement
                </span>
              </label>

              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-slate-400">Audience:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 text-xs focus:outline-none"
                >
                  <option value="all">Entire Company</option>
                  <option value="Engineering">Engineering Only</option>
                  <option value="Design">Product & Design</option>
                  <option value="HR">Human Resources</option>
                </select>
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1 text-slate-500">
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
                title="Attach photo/video"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-slate-100 hover:text-blue-600 transition-colors"
                title="Attach document"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-slate-100 hover:text-amber-500 transition-colors"
                title="Insert emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={!newPostContent.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Post
            </Button>
          </div>
        </form>
      </Card>

      {/* Post Stream */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const isAuthor = post.author_id === currentUser.id;
          const isExpanded = expandedPostId === post.id;

          return (
            <Card key={post.id} className="p-5 sm:p-6 space-y-4">
              {/* Post Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author_avatar}
                    alt={post.author_name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{post.author_name}</h4>
                      {post.is_announcement && (
                        <Badge variant="warning" size="sm" className="gap-1">
                          <Pin className="w-2.5 h-2.5" />
                          Announcement
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {post.author_designation} • {post.created_at}
                    </p>
                  </div>
                </div>

                {/* Post Options Menu */}
                <div className="flex items-center gap-1">
                  {(isAuthor || isAdmin) && (
                    <button
                      onClick={() => deletePost(post.id)}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Author-only Post Insights Bar (as required by Section 4.5) */}
              {isAuthor && (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-medium">
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      {post.impressions_count} Impressions
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 font-medium">
                      <BarChart2 className="w-3.5 h-3.5 text-emerald-500" />
                      {post.reach_count} Unique Reach
                    </span>
                  </div>
                  <button
                    onClick={() => setInsightsPost(post)}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    View Analytics
                  </button>
                </div>
              )}

              {/* Interactions Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors ${
                    post.has_liked
                      ? "text-red-600 bg-red-50/80"
                      : "hover:text-red-600 hover:bg-slate-50"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.has_liked ? "fill-red-600 text-red-600" : ""}`} />
                  <span>{post.likes_count}</span>
                </button>

                <button
                  onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comments_count} Comments</span>
                </button>

                <button className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:text-slate-800 hover:bg-slate-50 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              {/* Comments Section */}
              {isExpanded && (
                <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in">
                  {/* Comments List */}
                  <div className="space-y-2.5">
                    {post.comments.map((comm) => (
                      <div key={comm.id} className="flex items-start gap-2.5 text-xs">
                        <img
                          src={comm.author_avatar}
                          alt={comm.author_name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 mt-0.5"
                        />
                        <div className="flex-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{comm.author_name}</span>
                            <span className="text-[10px] text-slate-400">{comm.created_at}</span>
                          </div>
                          <p className="text-slate-700 mt-1">{comm.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment Input */}
                  <div className="flex items-center gap-2 pt-2">
                    <img
                      src={currentUser.avatar_url}
                      alt={currentUser.first_name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
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
                      className="flex-1 bg-slate-50 rounded-xl px-3 py-1.5 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleCommentSubmit(post.id)}
                      className="p-1.5 text-blue-600 hover:text-blue-700 disabled:opacity-40"
                      disabled={!commentInputs[post.id]?.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-8">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">No posts in this view</h4>
            <p className="text-xs text-slate-400 mt-1">
              Share an update or switch filters to view more workplace activity.
            </p>
          </div>
        )}
      </div>

      {/* Post Insights Modal */}
      <Modal
        isOpen={!!insightsPost}
        onClose={() => setInsightsPost(null)}
        title="Post Engagement & Reach Insights"
        description="Detailed visibility analytics for your published post."
      >
        {insightsPost && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <p className="text-slate-500">Total Impressions</p>
                <h4 className="text-2xl font-bold text-blue-700 mt-1">
                  {insightsPost.impressions_count}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Card viewed for at least 1.0 second in viewport
                </p>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <p className="text-slate-500">Unique Reach</p>
                <h4 className="text-2xl font-bold text-emerald-700 mt-1">
                  {insightsPost.reach_count}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Distinct workplace colleagues
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Reactions:</span>
                <span className="font-bold text-slate-900">{insightsPost.likes_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Comments:</span>
                <span className="font-bold text-slate-900">{insightsPost.comments_count}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
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
