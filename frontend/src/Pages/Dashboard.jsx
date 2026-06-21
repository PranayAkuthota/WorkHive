import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import ChatDrawer from "../Components/ChatDrawer";

// Helper to decode JWT payload on the client side
const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export default function Dashboard() {
  const [name, setName] = useState("");
  const [projects, setProjects] = useState([]);
  const [taskCount, setTaskCount] = useState(0);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Role & Tab state management
  const [role] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return "Member";
    const decoded = decodeToken(token);
    return decoded?.role || "Member";
  });
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "team"
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Logout function
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  // Fetch projects when component mounts
  const fetchProjects = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: token }
      });
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  }, [handleLogout]);

  // Fetch tasks to display active metric count
  const fetchTasksCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: token }
      });
      setTaskCount(res.data.length);
    } catch (err) {
      console.error("Failed to fetch tasks count:", err);
    }
  }, []);

  // Fetch users for admin team management
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: token }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Remove user from tenant
  const removeUser = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this user from the workspace?")) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: token }
      });
      alert("User removed successfully.");
      fetchUsers();
    } catch (err) {
      console.error("Failed to remove user:", err);
      alert("Failed to remove user: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTasksCount();
  }, [fetchProjects, fetchTasksCount]);

  // Fetch users when on team management tab
  useEffect(() => {
    if (activeTab === "team" && role === "Admin") {
      fetchUsers();
    }
  }, [activeTab, role, fetchUsers]);

  // Fetch invite code for current organization
  useEffect(() => {
    const fetchInviteCode = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await axios.get("http://localhost:5000/api/organizations/invite-code", {
          headers: { Authorization: token }
        });
        setInviteCode(res.data.inviteCode);
      } catch (err) {
        console.error("Failed to fetch invite code", err);
      }
    };
    fetchInviteCode();
  }, []);

  // Create a new project
  const createProject = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a project name");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/projects",
        { name },
        { headers: { Authorization: token } }
      );
      setName("");
      fetchProjects(); // Refresh projects list
    } catch (err) {
      console.error("Failed to create project:", err);
      alert("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row font-sans">
      
      {/* Decorative Blur Ambient Elements */}
      <div className="absolute w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[140px] top-10 left-10 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] bottom-10 right-10 pointer-events-none" />
      
      {/* Sidebar Component */}
      <aside className="w-full md:w-64 bg-zinc-900/40 border-b md:border-b-0 md:border-r border-zinc-900 backdrop-blur-xl flex flex-col justify-between p-6 z-10">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-indigo-300">
              Workhive
            </span>
          </div>
 
          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 font-medium px-4 py-2.5 rounded-lg border transition-all duration-300 ${
                activeTab === "overview"
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border-transparent"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Dashboard
            </button>
            
            <Link
              to="/tasks"
              className="flex items-center gap-3 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 px-4 py-2.5 rounded-lg transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Tasks
            </Link>

            {role === "Admin" && (
              <button
                onClick={() => setActiveTab("team")}
                className={`w-full flex items-center gap-3 font-medium px-4 py-2.5 rounded-lg border transition-all duration-300 ${
                  activeTab === "team"
                    ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border-transparent"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.07-.47.07-.94 0-1.41L12.07 12h2.24l.07.41c.21 1.28.87 2.43 1.83 3.25L17 16v1h-4.07zM11.07 12H4.93l-.07.41c-.21 1.28-.87 2.43-1.83 3.25L2 16v1h14v-1l-2.07-.34a5.004 5.004 0 00-1.83-3.25L11.07 12z" />
                </svg>
                Team
              </button>
            )}
          </nav>
        </div>
 
        {/* Invite Code Block (Sidebar Bottom) */}
        <div className="mt-8 pt-6 border-t border-zinc-900 space-y-4">
          {inviteCode && (
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4">
              <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                Invite Code
              </span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-indigo-400 bg-zinc-900/80 px-2.5 py-1 rounded border border-zinc-800 select-all">
                  {inviteCode}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inviteCode);
                    alert("Invite code copied to clipboard!");
                  }}
                  className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-indigo-400 transition-colors"
                  title="Copy Invite Code"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
 
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/5 px-4 py-2.5 rounded-lg border border-transparent hover:border-red-500/10 transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            Log Out
          </button>
        </div>
      </aside>
 
      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-10 z-10 overflow-y-auto">
        {activeTab === "overview" ? (
          <>
            <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-blue-100 to-indigo-400 tracking-tight m-0">
                  Workspace Overview
                </h1>
                <p className="text-zinc-400 text-sm mt-1">Manage and track your active tenant projects</p>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-zinc-900/30 border border-zinc-900 px-4 py-2.5 rounded-xl flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs text-zinc-400 font-medium">Database Connected</span>
                </div>
              </div>
            </header>
 
            {/* Premium Statistics Overview Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 hover:border-zinc-800 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Projects</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-zinc-100">{projects.length}</div>
              </div>
 
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 hover:border-zinc-800 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Assigned Tasks</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-zinc-100">{taskCount}</div>
              </div>
 
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 hover:border-zinc-800 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">System Health</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <div className="text-lg font-bold text-emerald-400">Stable</div>
              </div>
            </section>
 
            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Create Project Card (Col Span 1) */}
              {role !== "Member" && (
                <section className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6 h-fit space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-200 mb-1">Create Project</h2>
                    <p className="text-xs text-zinc-500">Initialize a new container for tasks</p>
                  </div>
                  
                  <form onSubmit={createProject} className="space-y-4">
                    <input
                      className="bg-zinc-950 border border-zinc-900 rounded-lg p-3 w-full text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500/30 transition-all duration-300 text-sm"
                      placeholder="e.g. Website Redesign"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 rounded-lg transition-all duration-300 transform active:scale-95 disabled:opacity-50 text-sm shadow-lg shadow-indigo-500/10"
                    >
                      {loading ? "Creating..." : "Create Project"}
                    </button>
                  </form>
                </section>
              )}
 
              {/* Projects List Card (Col Span 2 / Col Span 3 for Members) */}
              <section className={`${role === "Member" ? "lg:col-span-3" : "lg:col-span-2"} space-y-6`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-zinc-200 m-0">Your Projects</h2>
                  <span className="text-xs text-zinc-500 font-mono">
                    {projects.length} {projects.length === 1 ? "project" : "projects"} total
                  </span>
                </div>
 
                {projects.length === 0 ? (
                  <div className="bg-zinc-900/10 border border-zinc-900 border-dashed rounded-2xl p-10 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-zinc-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-zinc-500 text-sm font-medium">No projects created yet.</p>
                    <p className="text-zinc-600 text-xs mt-1">Use the left panel to register your first project.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {projects.map((p) => (
                      <div
                        key={p._id}
                        className="bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 rounded-xl p-5 shadow transition-all duration-300 group hover:-translate-y-0.5"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                              Project
                            </span>
                            <h3 className="text-base font-bold text-zinc-200 group-hover:text-indigo-400 transition-colors">
                              {p.name}
                            </h3>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 transition-colors border border-zinc-800/50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
 
                {/* Premium "Recent Activity Timeline" */}
                <div className="pt-6">
                  <h2 className="text-lg font-bold text-zinc-200 mb-4">Recent Workspace Actions</h2>
                  <div className="bg-zinc-900/10 border border-zinc-900 rounded-2xl p-6 space-y-4">
                    <div className="flex items-start gap-4 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-zinc-300">Workspace project initialized</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">2 minutes ago • System Event</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-zinc-300">New colleague registered workspace session</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">15 minutes ago • Security log</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </>
        ) : (
          /* Team Management Pane (Admin Only) */
          role === "Admin" && (
            <div className="space-y-6">
              <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-blue-100 to-indigo-400 tracking-tight m-0">
                  Team Management
                </h1>
                <p className="text-zinc-400 text-sm mt-1">Manage organization members, assign roles, and revoke workspace access</p>
              </header>

              {/* Invite Code Reminder Callout */}
              {inviteCode && (
                <div className="bg-gradient-to-r from-indigo-950/40 to-blue-950/40 border border-indigo-900/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-indigo-300">Invite new team members</h3>
                    <p className="text-xs text-zinc-400">Share your organization's unique invite code. New members can join as Managers or Members.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="text-sm font-mono text-indigo-400 bg-zinc-950/80 px-3.5 py-1.5 rounded-lg border border-zinc-800 select-all font-semibold">
                      {inviteCode}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(inviteCode);
                        alert("Invite code copied to clipboard!");
                      }}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white transition-colors"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>
              )}

              {/* Team Members List */}
              <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-zinc-200">Active Workspace Users</h2>
                  <span className="text-xs text-zinc-500 font-mono">
                    {users.length} {users.length === 1 ? "user" : "users"} total (excluding you)
                  </span>
                </div>

                {usersLoading ? (
                  <div className="text-center py-10 text-zinc-500 text-sm">
                    <span className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-3 align-middle" />
                    Loading team members...
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12 border border-zinc-900 border-dashed rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-zinc-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-zinc-500 text-sm font-medium">No other members registered in your organization.</p>
                    <p className="text-zinc-600 text-xs mt-1">Share the invite code to grow your workspace team!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-900 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                          <th className="pb-3 pl-2">User details</th>
                          <th className="pb-3">Role</th>
                          <th className="pb-3">Registration date</th>
                          <th className="pb-3 text-right pr-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/60 text-sm">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-zinc-900/10 transition-colors group">
                            <td className="py-4 pl-2">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400">
                                  {u.name?.charAt(0).toUpperCase() || "?"}
                                </div>
                                <div>
                                  <p className="font-semibold text-zinc-200">{u.name}</p>
                                  <p className="text-xs text-zinc-500">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                u.role === "Admin"
                                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                  : u.role === "Manager"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-4 text-zinc-400 text-xs">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : "N/A"}
                            </td>
                            <td className="py-4 text-right pr-2">
                              {u.role !== "Admin" ? (
                                <button
                                  onClick={() => removeUser(u._id)}
                                  className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-semibold transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] active:scale-95"
                                >
                                  Remove User
                                </button>
                              ) : (
                                <span className="text-xs text-zinc-600 font-medium italic">Root Administrator</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </main>
      <ChatDrawer />
    </div>
  );
}