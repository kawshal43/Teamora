"use client";

import React, { useState } from "react";
import { 
  Camera, 
  Lock, 
  Bell, 
  User, 
  Shield, 
  Building2, 
  Mail, 
  Phone, 
  Check, 
  UploadCloud 
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function SettingPage() {
  const { currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  // Profile form
  const [phone, setPhone] = useState(currentUser.phone || "+1 (555) 234-8921");
  const [bio, setBio] = useState("Passionate about building fluid, accessible web interfaces and design systems.");
  const [isSaved, setIsSaved] = useState(false);

  // Security form
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw === confirmPw && newPw.length >= 6) {
      setPwSaved(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTimeout(() => setPwSaved(false), 2500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Settings Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account & Profile Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your personal information, profile photo, and security preferences.
        </p>
      </div>

      {/* Settings Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "profile"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "security"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Password & Security</span>
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "notifications"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Avatar Card */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Profile Photo</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.first_name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-800 shadow-md"
                />
                <button
                  onClick={() => setShowAvatarModal(true)}
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Upload new photo"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAvatarModal(true)}
                  className="gap-2"
                >
                  <UploadCloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Change Profile Photo</span>
                </Button>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Recommended: Square JPG or PNG, 500x500px or larger.
                </p>
              </div>
            </div>
          </Card>

          {/* Employment Details (Read-only as per specification) */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Employment Information</h3>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">Managed by HR</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-slate-400 dark:text-slate-500 font-medium">Employee ID</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{currentUser.employee_id}</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-slate-400 dark:text-slate-500 font-medium">Department</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{currentUser.department_name}</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-slate-400 dark:text-slate-500 font-medium">Designation</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{currentUser.designation}</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-slate-400 dark:text-slate-500 font-medium">Role</p>
                <p className="font-bold text-blue-600 dark:text-blue-400 mt-0.5 capitalize">{currentUser.role.replace("_", " ")}</p>
              </div>
            </div>
          </Card>

          {/* Self-Service Personal Info Form */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              Personal Information
            </h3>

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Email</label>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bio / Profile Headline</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {isSaved ? (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Changes saved successfully!
                  </span>
                ) : <span />}

                <Button type="submit" size="sm" variant="primary">
                  Save Preferences
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* TAB 2: SECURITY */}
      {activeTab === "security" && (
        <Card className="p-6 max-w-xl">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Change Account Password
          </h3>

          <form onSubmit={handlePasswordSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {pwSaved && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Password updated!
                </span>
              )}
              <Button type="submit" size="sm" variant="primary" className="ml-auto">
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 3: NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <Card className="p-6 max-w-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Notification Preferences
          </h3>

          <div className="space-y-3">
            {[
              { title: "Feed Reactions & Comments", desc: "Notify when colleagues like or comment on your posts." },
              { title: "Worksheet Approvals", desc: "Get notified when a supervisor approves your daily report." },
              { title: "Task Assignments", desc: "Receive immediate updates when tasks are delegated to you." },
              { title: "Attendance Reminders", desc: "Receive reminders if you forget to check out at the end of the shift." },
            ].map((item, i) => (
              <label key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{item.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>
      )}

      {/* AVATAR CROP/UPLOAD MODAL */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title="Crop & Upload Profile Picture"
        description="Select an image file and center your face inside the circular crop preview."
      >
        <div className="space-y-4 text-center">
          <div className="w-36 h-36 mx-auto rounded-full ring-4 ring-blue-100 dark:ring-blue-900/50 overflow-hidden shadow-inner relative bg-slate-100 dark:bg-slate-800">
            <img
              src={currentUser.avatar_url}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-xs text-slate-500">
            Drag to reposition or click below to choose a different photo file.
          </p>

          <div className="flex justify-center gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => setShowAvatarModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={() => setShowAvatarModal(false)}>
              Save Photo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

