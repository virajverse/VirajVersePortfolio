"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Eye,
  PlusCircle,
  LayoutGrid,
  FolderKanban,
  Layers,
  LogOut,
  ExternalLink,
  Globe,
  Github,
  Plus,
  Trash2,
  Edit3,
  Save,
  UploadCloud,
  CheckCircle2,
  ShieldAlert,
  Database,
  ArrowLeft,
  X,
  FileCode,
  Mail,
  Inbox,
  Clock,
  User
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────
type Highlight = { heading: string; points: string[] };

type ProjectForm = {
  id: string;
  title: string;
  category: string;
  description: string;
  live: string;
  github: string;
  imageSrc: string;
  screenshots: string[];
  skills: string;        // comma-separated in form
  highlights: Highlight[];
  order: number;
};

const EMPTY_FORM: ProjectForm = {
  id: "",
  title: "",
  category: "",
  description: "",
  live: "",
  github: "",
  imageSrc: "",
  screenshots: [],
  skills: "",
  highlights: [{ heading: "", points: [""] }],
  order: 0,
};

const SKILL_OPTIONS = [
  "js", "ts", "python", "react", "next", "tailwind", "nodejs", "node",
  "express", "supabase", "postgres", "mongo", "docker", "aws", "git",
  "github", "linux", "vercel", "vite", "framerMotion", "openai",
  "firebase", "vue", "shadcn", "html", "css", "bootstrap"
];

// ─── Admin Page ───────────────────────────────────────────────
export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);
  const [editing, setEditing] = useState<string | null>(null);
  const [status, setStatus] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"list" | "form" | "messages">("list");
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [uploadPreview, setUploadPreview] = useState<string>("");
  const [screenshotStatus, setScreenshotStatus] = useState<string>("");

  // password gate
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    setMounted(true);
    // check session cache on client load
    const cachedKey = sessionStorage.getItem("admin_key");
    if (cachedKey) {
      fetch("/api/admin/auth", {
        headers: { "x-admin-token": cachedKey }
      })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setToken(cachedKey);
          setAuthed(true);
        } else {
          sessionStorage.removeItem("admin_key");
        }
      })
      .catch(() => {});
    }
  }, []);

  // helper: authenticated fetch for mutating calls
  const authFetch = (url: string, options: RequestInit = {}) =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers ?? {}),
        "x-admin-token": token,
      },
    });

  useEffect(() => {
    if (authed) {
      fetchProjects();
      fetchMessages();
    }
  }, [authed]);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjects(data);
      }
    } catch (e) {
      console.error("Failed to load projects", e);
    }
  }

  async function fetchMessages() {
    try {
      const res = await authFetch("/api/messages");
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (e) {
      console.error("Failed to load messages", e);
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm("Delete this message?")) return;
    try {
      const res = await authFetch(`/api/messages?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showStatus("Message deleted.", "success");
        fetchMessages();
      } else {
        showStatus("Failed to delete message.", "error");
      }
    } catch {
      showStatus("Network error occurred.", "error");
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!form.id) {
      setUploadStatus("❌ Enter Project ID first before uploading image");
      return;
    }

    // local preview
    const reader = new FileReader();
    reader.onload = (ev) => setUploadPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploadStatus("⏳ Uploading...");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("projectId", form.id);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-admin-token": token },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        setForm((f) => ({ ...f, imageSrc: data.path }));
        setUploadStatus(`✅ Uploaded successfully`);
      } else {
        setUploadStatus(`❌ ${data.error}`);
      }
    } catch {
      setUploadStatus("❌ Upload failed");
    }
  }

  async function handleScreenshotUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!form.id) {
      setScreenshotStatus("❌ Enter Project ID first before uploading screenshots");
      return;
    }

    setScreenshotStatus(`⏳ Uploading ${files.length} image(s)...`);

    let uploadedPaths: string[] = [];
    let errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fd = new FormData();
      fd.append("file", file);
      fd.append("projectId", form.id);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "x-admin-token": token },
          body: fd
        });
        const data = await res.json();
        if (data.success) {
          uploadedPaths.push(data.path);
        } else {
          errors.push(data.error || "Failed");
        }
      } catch {
        errors.push("Failed to upload " + file.name);
      }
    }

    if (uploadedPaths.length > 0) {
      setForm((f) => ({
        ...f,
        screenshots: [...(f.screenshots || []), ...uploadedPaths],
      }));
    }

    if (errors.length > 0) {
      setScreenshotStatus(`⚠️ Uploaded ${uploadedPaths.length} files. Errors: ${errors.join(", ")}`);
    } else {
      setScreenshotStatus(`✅ Successfully uploaded ${uploadedPaths.length} screenshots!`);
    }
  }

  async function saveProject() {
    if (!form.id || !form.title) {
      showStatus("ID and Title are required.", "error");
      return;
    }
    setLoading(true);
    const payload = {
      ...form,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      const res = await authFetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        showStatus("Project saved successfully!", "success");
        setForm(EMPTY_FORM);
        setEditing(null);
        setTab("list");
        fetchProjects();
      } else {
        showStatus(data.error || "Failed to save project", "error");
      }
    } catch {
      showStatus("Network error occurred.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteProject(id: string) {
    if (!confirm(`Are you absolutely sure you want to delete project "${id}"?`)) return;
    try {
      const res = await authFetch(`/api/projects?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showStatus(`Project "${id}" has been deleted.`, "success");
        fetchProjects();
      } else {
        showStatus("Failed to delete project.", "error");
      }
    } catch {
      showStatus("Network error occurred.", "error");
    }
  }

  function editProject(p: any) {
    setForm({
      ...p,
      skills: Array.isArray(p.skills) ? p.skills.join(", ") : p.skills,
      highlights: p.highlights?.length ? p.highlights : [{ heading: "", points: [""] }],
      screenshots: Array.isArray(p.screenshots) ? p.screenshots : [],
      order: p.order ?? 0,
    });
    setEditing(p.id);
    setUploadPreview(p.imageSrc || "");
    setUploadStatus("");
    setTab("form");
  }

  function newProject() {
    setForm(EMPTY_FORM);
    setEditing(null);
    setUploadPreview("");
    setUploadStatus("");
    setTab("form");
  }

  function showStatus(text: string, type: "success" | "error") {
    setStatus({ text, type });
    setTimeout(() => setStatus({ text: "", type: "" }), 5000);
  }

  // highlight helpers
  function addHighlight() {
    setForm((f) => ({ ...f, highlights: [...f.highlights, { heading: "", points: [""] }] }));
  }
  function removeHighlight(i: number) {
    setForm((f) => ({ ...f, highlights: f.highlights.filter((_, idx) => idx !== i) }));
  }
  function updateHighlight(i: number, field: "heading", value: string) {
    setForm((f) => {
      const h = [...f.highlights];
      h[i] = { ...h[i], [field]: value };
      return { ...f, highlights: h };
    });
  }
  function addPoint(hi: number) {
    setForm((f) => {
      const h = [...f.highlights];
      h[hi] = { ...h[hi], points: [...h[hi].points, ""] };
      return { ...f, highlights: h };
    });
  }
  function updatePoint(hi: number, pi: number, value: string) {
    setForm((f) => {
      const h = [...f.highlights];
      const pts = [...h[hi].points];
      pts[pi] = value;
      h[hi] = { ...h[hi], points: pts };
      return { ...f, highlights: h };
    });
  }
  function removePoint(hi: number, pi: number) {
    setForm((f) => {
      const h = [...f.highlights];
      h[hi] = { ...h[hi], points: h[hi].points.filter((_, idx) => idx !== pi) };
      return { ...f, highlights: h };
    });
  }

  async function handleAuthSubmit() {
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setToken(pw);
        setAuthed(true);
        sessionStorage.setItem("admin_key", pw);
      } else {
        showStatus(data.error || "Incorrect Password Credentials", "error");
      }
    } catch {
      showStatus("Authentication request failed", "error");
    }
  }

  // Count unique categories in active list
  const uniqueCategories = Array.from(new Set(projects.map(p => p.category))).length;

  if (!mounted) {
    return <div className="min-h-screen bg-zinc-950" />;
  }

  // ─── Password Gate Redesign ───────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Glow backdrop circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-cyan-600/5 blur-[100px] pointer-events-none" />

        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10 transition-all duration-300">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20 mb-4 ring-1 ring-white/10">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Security Gate</h1>
            <p className="text-zinc-400 text-sm mt-1">Admin access credentials validation</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    await handleAuthSubmit();
                  }
                }}
                placeholder="Enter workspace key..."
                className="w-full bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none transition-all duration-300 placeholder:text-zinc-600"
              />
            </div>

            <button
              onClick={handleAuthSubmit}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white font-semibold py-3 rounded-xl shadow-lg shadow-violet-600/10 hover:shadow-violet-600/20 transition-all duration-300 text-sm tracking-wide"
            >
              Access Dashboard
            </button>
          </div>

          {status.text && (
            <div className="mt-4 flex items-center gap-2 bg-red-950/30 border border-red-900/30 rounded-xl px-4 py-3 text-red-400 text-xs font-mono">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{status.text}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Workspace Redesign ───────────────────────────────────
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black text-zinc-100 flex relative overflow-hidden">
      {/* Background static glow elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-72 w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

      {/* ── SIDEBAR ── */}
      <aside className="w-80 bg-zinc-950/60 backdrop-blur-xl border-r border-zinc-900/80 flex flex-col justify-between flex-shrink-0 z-20 relative">
        <div className="p-6">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-zinc-900/80 mb-6">
            <div className="relative w-10 h-10 rounded-full border border-zinc-800/80 overflow-hidden flex-shrink-0 bg-black">
              <img src="/assets/logo.png" alt="Virajverse Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider text-white uppercase">Virajverse</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-zinc-500">Supabase Connected</span>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setTab("list")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                tab === "list"
                  ? "bg-violet-600/10 text-violet-400 border border-violet-500/20 shadow-md shadow-violet-500/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/50 border border-transparent"
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Project Records</span>
              <span className="ml-auto text-[10px] font-mono bg-zinc-900 text-zinc-500 rounded px-1.5 py-0.5 border border-zinc-800">
                {projects.length}
              </span>
            </button>

            <button
              onClick={newProject}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                tab === "form" && !editing
                  ? "bg-violet-600/10 text-violet-400 border border-violet-500/20 shadow-md shadow-violet-500/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/50 border border-transparent"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Record</span>
            </button>

            <button
              onClick={() => { setTab("messages"); fetchMessages(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                tab === "messages"
                  ? "bg-violet-600/10 text-violet-400 border border-violet-500/20 shadow-md shadow-violet-500/5"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/50 border border-transparent"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Contact Messages</span>
              {messages.length > 0 && (
                <span className="ml-auto text-[10px] font-mono bg-violet-600/20 text-violet-400 rounded px-1.5 py-0.5 border border-violet-500/30">
                  {messages.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Metrics */}
        <div className="p-6 border-t border-zinc-900/80 bg-black/20">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500 flex items-center gap-1.5"><Database className="w-3.5 h-3.5" /> Database</span>
              <span className="font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-[10px]">Cloud SDK</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Site Status</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Live
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setAuthed(false);
              setToken("");
              sessionStorage.removeItem("admin_key");
            }}
            className="w-full flex items-center justify-center gap-2 mt-5 text-xs text-zinc-500 hover:text-red-400 bg-zinc-950 border border-zinc-900 hover:border-red-950/50 px-3 py-2.5 rounded-xl transition duration-300"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout Workspace
          </button>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE ── */}
      <main className="flex-1 overflow-y-auto z-10 relative flex flex-col">
        {/* Workspace Topbar */}
        <header className="h-20 bg-zinc-950/20 border-b border-zinc-900/80 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-white tracking-tight">
              {tab === "list" ? "Dashboard Panel" : tab === "messages" ? "Contact Inbox" : editing ? "Modify Record" : "Create Record"}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {tab === "messages" ? `${messages.length} messages received` : "Workspace storage control room"}
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-4 py-2 rounded-xl transition-all duration-300"
            >
              <span>View Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Notifications and messages banner */}
        {status.text && (
          <div className="mx-8 mt-6">
            <div className={`flex items-center justify-between border rounded-xl px-4 py-3.5 shadow-lg ${
              status.type === "success"
                ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-400"
                : "bg-red-950/20 border-red-900/30 text-red-400"
            }`}>
              <div className="flex items-center gap-2.5 text-sm font-medium">
                {status.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                <span>{status.text}</span>
              </div>
              <button onClick={() => setStatus({ text: "", type: "" })} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Content Container */}
        <div className="p-8 flex-1">
          {/* ── STATS COUNTER BLOCKS ── */}
          {tab === "list" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 flex items-center justify-between hover:border-zinc-800 transition-all duration-300">
                <div>
                  <span className="text-xs text-zinc-500 font-bold tracking-wider uppercase block">Total Projects</span>
                  <span className="text-3xl font-black text-white mt-1 block">{projects.length}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <FolderKanban className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 flex items-center justify-between hover:border-zinc-800 transition-all duration-300">
                <div>
                  <span className="text-xs text-zinc-500 font-bold tracking-wider uppercase block">Active Categories</span>
                  <span className="text-3xl font-black text-white mt-1 block">{uniqueCategories}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Layers className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 flex items-center justify-between hover:border-zinc-800 transition-all duration-300">
                <div>
                  <span className="text-xs text-zinc-500 font-bold tracking-wider uppercase block">Server Status</span>
                  <span className="text-3xl font-black text-emerald-400 mt-1 block flex items-center gap-1.5">
                    Online
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          {/* ── PROJECTS LIST VIEW ── */}
          {tab === "list" && (
            <div className="space-y-4">
              {projects.length === 0 && (
                <div className="bg-zinc-900/20 border border-dashed border-zinc-800/80 rounded-2xl py-24 text-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto mb-4">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white text-base">No projects listed</h3>
                  <p className="text-zinc-500 text-sm mt-1 max-w-xs mx-auto">Create database records to display them in this workspace grid.</p>
                  <button
                    onClick={newProject}
                    className="mt-4 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition duration-300"
                  >
                    + Add New Project
                  </button>
                </div>
              )}

              {projects.map((p) => (
                <div
                  key={p.id}
                  className="bg-zinc-900/30 hover:bg-zinc-900/60 backdrop-blur-md border border-zinc-900 hover:border-zinc-800/80 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-5 transition-all duration-300 hover:shadow-lg group"
                >
                  {/* Image cover column */}
                  <div className="w-28 h-20 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                    {p.imageSrc ? (
                      <img src={p.imageSrc} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" onError={(e) => (e.currentTarget.style.display = "none")} />
                    ) : (
                      <FileCode className="w-6 h-6 text-zinc-700" />
                    )}
                  </div>

                  {/* Text details column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold bg-violet-950/40 text-violet-400 border border-violet-900/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {p.category}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">
                        ID: {p.id}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">
                        Order: {p.order}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-base truncate group-hover:text-violet-400 transition-colors duration-300">
                      {p.title}
                    </h3>
                    <p className="text-zinc-400 text-xs mt-1 line-clamp-2 pr-4">{p.description}</p>
                    
                    {/* Tags row */}
                    {p.skills && p.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {p.skills.map((s: string) => (
                          <span key={s} className="text-[10px] bg-zinc-950 border border-zinc-900 text-zinc-400 px-2 py-0.5 rounded font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions column */}
                  <div className="flex md:flex-col lg:flex-row gap-2 flex-shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t border-zinc-900 md:border-none">
                    <button
                      onClick={() => editProject(p)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 transition duration-300"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => deleteProject(p.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-red-950/30 hover:bg-red-900/40 text-red-400 hover:text-red-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-red-900/20 hover:border-red-900/40 transition duration-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── MESSAGES INBOX VIEW ── */}
          {tab === "messages" && (
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="bg-zinc-900/20 border border-dashed border-zinc-800/80 rounded-2xl py-24 text-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto mb-4">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white text-base">Inbox is empty</h3>
                  <p className="text-zinc-500 text-sm mt-1 max-w-xs mx-auto">
                    Contact form submissions from your portfolio website will appear here.
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-zinc-900/30 hover:bg-zinc-900/60 backdrop-blur-md border border-zinc-900 hover:border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Sender info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{msg.full_name}</p>
                        <a
                          href={`mailto:${msg.email}`}
                          className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          {msg.email}
                        </a>
                      </div>
                    </div>

                    {/* Timestamp + Delete */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {msg.created_at && (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 bg-zinc-950 border border-zinc-900 px-2 py-1 rounded-lg">
                          <Clock className="w-3 h-3" />
                          {new Date(msg.created_at).toLocaleString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </div>
                      )}
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="w-8 h-8 rounded-lg bg-red-950/30 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-900/20 hover:border-red-900/40 flex items-center justify-center transition duration-300"
                        title="Delete message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl px-4 py-3">
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>

                  {/* Reply button */}
                  <div className="flex justify-end">
                    <a
                      href={`mailto:${msg.email}?subject=Re: Your message on Virajverse Portfolio`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-4 py-2 rounded-xl transition-all duration-300"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Reply via Email
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── PROJECT EDIT/CREATE FORM VIEW ── */}
          {tab === "form" && (
            <div className="max-w-4xl bg-zinc-900/30 backdrop-blur-md border border-zinc-900 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-600 to-indigo-500" />
              
              {/* Form title header */}
              <div className="flex items-center gap-3 pb-6 border-b border-zinc-900 mb-8">
                <button
                  onClick={() => { setTab("list"); setForm(EMPTY_FORM); setEditing(null); }}
                  className="w-8 h-8 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-black text-white text-base">
                    {editing ? `Modify Record: ${editing}` : "Create Database Record"}
                  </h3>
                  <p className="text-xs text-zinc-500">Insert custom metadata fields to database table projects</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* ID + Category Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                      Project Unique Slug <span className="text-violet-500">*</span>
                    </label>
                    <input
                      value={form.id}
                      onChange={(e) => setForm({ ...form, id: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                      placeholder="e.g. taliyo-ai-dashboard"
                      disabled={!!editing}
                      className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all duration-300 disabled:opacity-50 font-mono"
                    />
                    <p className="text-[10px] text-zinc-600 mt-1.5">This forms the project page URL endpoint. Spaces are automatically replaced with dashes.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Category Label</label>
                    <input
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="e.g. AI Engineering"
                      className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all duration-300"
                    />
                    <p className="text-[10px] text-zinc-600 mt-1.5">Group indicator shown above title cards.</p>
                  </div>
                </div>

                {/* Title + Display Order Fields */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                      Project Display Name <span className="text-violet-500">*</span>
                    </label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Taliyo Technologies"
                      className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Display Sort Order</label>
                    <input
                      type="number"
                      min={0}
                      value={form.order}
                      onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all duration-300 font-mono"
                    />
                    <p className="text-[10px] text-zinc-600 mt-1.5">Lower indices display first.</p>
                  </div>
                </div>

                {/* Description Textarea */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Short Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Short summary detail overlay description..."
                    rows={4}
                    className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all duration-300 resize-none"
                  />
                </div>

                {/* Live Site + GitHub Link Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Live URL</label>
                    <input
                      value={form.live}
                      onChange={(e) => setForm({ ...form, live: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all duration-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">GitHub URL</label>
                    <input
                      value={form.github}
                      onChange={(e) => setForm({ ...form, github: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all duration-300 font-mono"
                    />
                  </div>
                </div>

                {/* Cover Image Upload Block */}
                <div className="border-t border-zinc-900 pt-6">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Cover Image Setup</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <input
                        value={form.imageSrc}
                        onChange={(e) => setForm({ ...form, imageSrc: e.target.value })}
                        placeholder="/assets/projects-screenshots/my-project/1.png"
                        className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all duration-300 font-mono mb-3"
                      />
                      <label
                        htmlFor="img-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-zinc-800 hover:border-violet-500/50 rounded-xl cursor-pointer transition bg-zinc-950/30 hover:bg-zinc-950/50 group"
                      >
                        <UploadCloud className="w-6 h-6 text-zinc-500 group-hover:text-violet-400 mb-2 transition duration-300" />
                        <span className="text-xs text-zinc-400 font-semibold group-hover:text-zinc-300 transition duration-300">Click to upload cover image</span>
                        <span className="text-[9px] text-zinc-600 mt-0.5">PNG, JPG, WEBP, GIF</span>
                      </label>
                      <input
                        id="img-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      {uploadStatus && (
                        <p className={`text-[10px] mt-2 font-mono ${
                          uploadStatus.startsWith("✅")
                            ? "text-emerald-400"
                            : uploadStatus.startsWith("⏳")
                              ? "text-amber-400 animate-pulse"
                              : "text-red-400"
                        }`}>
                          {uploadStatus}
                        </p>
                      )}
                    </div>
                    
                    {/* Cover Preview display */}
                    <div className="w-full h-44 bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden flex items-center justify-center relative shadow-inner">
                      {uploadPreview ? (
                        <img src={uploadPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-zinc-600 font-semibold">Image Preview</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Screenshots Slideshow Block */}
                <div className="border-t border-zinc-900 pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">Slideshow Screenshot Assets</label>
                    <span className="text-[10px] font-mono text-zinc-500">{(form.screenshots || []).length} synced images</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <label
                      htmlFor="screenshots-upload"
                      className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-zinc-800 hover:border-violet-500/50 rounded-xl cursor-pointer transition bg-zinc-950/30 hover:bg-zinc-950/50 group"
                    >
                      <UploadCloud className="w-6 h-6 text-zinc-500 group-hover:text-violet-400 mb-2 transition duration-300" />
                      <span className="text-xs text-zinc-400 font-semibold group-hover:text-zinc-300 transition duration-300">Click to upload multiple screenshots</span>
                      <span className="text-[9px] text-zinc-600 mt-0.5">Select multiple images in file browser</span>
                    </label>
                    <input
                      id="screenshots-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleScreenshotUpload}
                    />
                    
                    {screenshotStatus && (
                      <p className={`text-[10px] font-mono ${
                        screenshotStatus.startsWith("✅")
                          ? "text-emerald-400"
                          : screenshotStatus.startsWith("⏳")
                            ? "text-amber-400 animate-pulse"
                            : "text-red-400"
                      }`}>
                        {screenshotStatus}
                      </p>
                    )}

                    {/* Screenshot Preview Grid */}
                    {(form.screenshots || []).length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 bg-zinc-950/20 border border-zinc-900 rounded-2xl p-4">
                        {(form.screenshots || []).map((scr, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden border border-zinc-900 aspect-video bg-black flex items-center justify-center hover:border-zinc-800 transition duration-300">
                            <img src={scr} alt={`Screenshot Preview ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                              <button
                                type="button"
                                onClick={() => {
                                  setForm((f) => ({
                                    ...f,
                                    screenshots: f.screenshots.filter((_, sIdx) => sIdx !== idx),
                                  }));
                                }}
                                className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition duration-200 shadow-md shadow-red-900/30"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[9px] text-zinc-300 font-mono px-2 py-0.5 rounded-md border border-zinc-800">
                              #{idx + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tech Skills Selection Block */}
                <div className="border-t border-zinc-900 pt-6">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Tech Stack Tags</label>
                  <input
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    placeholder="e.g. ts, react, next, supabase, docker"
                    className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all duration-300 font-mono mb-4"
                  />
                  <div className="bg-zinc-950/30 border border-zinc-900 rounded-2xl p-4 flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                    {SKILL_OPTIONS.map((s) => {
                      const isSelected = form.skills.split(",").map((x) => x.trim()).includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            const current = form.skills.split(",").map((x) => x.trim()).filter(Boolean);
                            if (current.includes(s)) {
                              setForm({ ...form, skills: current.filter((x) => x !== s).join(", ") });
                            } else {
                              setForm({ ...form, skills: [...current, s].join(", ") });
                            }
                          }}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-xl transition duration-300 uppercase tracking-wider border ${
                            isSelected
                              ? "bg-violet-600/10 text-violet-400 border-violet-500/20 shadow-md shadow-violet-500/5"
                              : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Highlights Accordion Block */}
                <div className="border-t border-zinc-900 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">Highlights / Key Features</label>
                    <button
                      type="button"
                      onClick={addHighlight}
                      className="flex items-center gap-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-300 text-xs font-semibold px-3 py-2 rounded-xl transition duration-300"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Section</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {form.highlights.map((h, hi) => (
                      <div key={hi} className="bg-zinc-950/40 border border-zinc-900/80 rounded-2xl p-5 relative">
                        <div className="flex gap-3 mb-4">
                          <input
                            value={h.heading}
                            onChange={(e) => updateHighlight(hi, "heading", e.target.value)}
                            placeholder="e.g. Highlights, Key Features, Main Integrations"
                            className="flex-1 bg-zinc-950 border border-zinc-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all duration-300 font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => removeHighlight(hi)}
                            className="w-10 h-10 rounded-xl bg-red-950/20 hover:bg-red-950/40 text-red-500 border border-red-900/10 hover:border-red-900/30 flex items-center justify-center transition duration-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-3 pl-4 border-l-2 border-zinc-900">
                          {h.points.map((pt, pi) => (
                            <div key={pi} className="flex gap-2">
                              <span className="text-zinc-600 text-sm mt-2">•</span>
                              <input
                                value={pt}
                                onChange={(e) => updatePoint(hi, pi, e.target.value)}
                                placeholder="Write highlight point..."
                                className="flex-1 bg-zinc-950 border border-zinc-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-4 py-2 text-xs text-white focus:outline-none transition-all duration-300"
                              />
                              <button
                                type="button"
                                onClick={() => removePoint(hi, pi)}
                                className="text-zinc-600 hover:text-red-400 text-xs px-2"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          
                          <button
                            type="button"
                            onClick={() => addPoint(hi)}
                            className="flex items-center gap-1 text-[10px] font-bold text-violet-400 hover:text-violet-300 mt-2 transition duration-300"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add point bullet</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save / Cancel Submit Options */}
                <div className="flex gap-3 pt-6 border-t border-zinc-900">
                  <button
                    onClick={saveProject}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-violet-600/10 hover:shadow-violet-600/20 transition-all duration-300 text-sm tracking-wide"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? "Saving Record..." : editing ? "Update Project" : "Save Project"}</span>
                  </button>
                  
                  <button
                    onClick={() => { setTab("list"); setForm(EMPTY_FORM); setEditing(null); }}
                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold px-6 py-3 rounded-xl border border-zinc-800 hover:border-zinc-700 transition duration-300 text-sm"
                  >
                    Cancel Action
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
