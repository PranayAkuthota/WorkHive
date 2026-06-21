import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import ChatDrawer from "../Components/ChatDrawer";

export default function TaskPage() {
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState("idle"); // idle, loading, success, error
  const [inviteCode, setInviteCode] = useState("");
  const navigate = useNavigate();

  // Fetch all tasks for current tenant
  const fetchTasks = async () => {
    try {
      setApiStatus("loading");
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("No authentication token found. Please log in.");
        setApiStatus("error");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/tasks", {
        headers: { Authorization: token },
      });

      setTasks(res.data);
      setError(null);
      setApiStatus("success");
    } catch (err) {
      console.error("Fetch tasks error:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch tasks");
      setApiStatus("error");
    }
  };

  // Fetch all projects for dropdown
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const res = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: token },
      });
      setProjects(res.data);
    } catch (err) {
      console.error("Fetch projects error:", err);
    }
  };

  // Fetch invite code
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
    fetchTasks();
    fetchProjects();
  }, []);

  const createTask = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }

    if (!projectId) {
      alert("Please select a project");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("No token found. Please log in again.");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/tasks",
        { title, projectId },
        {
          headers: { Authorization: token },
        }
      );

      setTitle("");
      setProjectId("");
      fetchTasks(); // Refresh list
    } catch (err) {
      console.error("Create task error:", err);
      alert(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  // Delete task handler
  const deleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: token },
      });
      fetchTasks(); // Refresh list
    } catch (err) {
      console.error("Delete task error:", err);
      alert("Failed to delete task");
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: token } }
      );
      fetchTasks();
    } catch (err) {
      console.error("Update task error:", err);
      alert("Failed to update task");
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Helper to determine status styling classes
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "In Progress":
        return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
      default:
        return "bg-zinc-800/40 text-zinc-400 border border-zinc-700/50";
    }
  };

  // Client-side filtering logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.projectId?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate project metrics
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.status === "Completed").length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  
  // Circle circumference is ~150 (r=24, 2 * pi * 24 = 150.7)
  const strokeDashoffset = 150 - (150 * progressPercent) / 100;

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
            <Link
              to="/dashboard"
              className="flex items-center gap-3 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 px-4 py-2.5 rounded-lg transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Dashboard
            </Link>
            
            <Link
              to="/tasks"
              className="flex items-center gap-3 bg-indigo-500/10 text-indigo-400 font-medium px-4 py-2.5 rounded-lg border border-indigo-500/20 transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Tasks
            </Link>
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
        
        {/* Header */}
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-blue-100 to-indigo-400 tracking-tight m-0">
              Tasks Dashboard
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Organize, status-track, and modify tenant actions</p>
          </div>
        </header>

        {/* Dynamic Critical Error banner */}
        {apiStatus === "error" && error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-sm">Error Loading Tasks</h3>
                <p className="text-xs text-red-400/80">{error}</p>
              </div>
            </div>
            <button 
              onClick={fetchTasks}
              className="bg-red-500 hover:bg-red-600 text-white text-xs px-3.5 py-1.5 rounded-lg transition-colors font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Create Task & Progress metrics */}
          <div className="space-y-8 h-fit">
            
            {/* Project Progress Meter Ring */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-zinc-200">Workspace Progress</h2>
                  <p className="text-xs text-zinc-500">Completed task ratio</p>
                </div>
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="24" className="stroke-zinc-900" strokeWidth="4" fill="transparent" />
                    <circle cx="28" cy="28" r="24" className="stroke-indigo-500 transition-all duration-500" strokeWidth="4" fill="transparent" strokeDasharray="150" strokeDashoffset={strokeDashoffset} />
                  </svg>
                  <span className="absolute text-xs font-bold text-indigo-400">{progressPercent}%</span>
                </div>
              </div>
            </div>

            {/* Create Task Card */}
            <section className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-zinc-200 mb-1">Create Task</h2>
              <p className="text-xs text-zinc-500 mb-6">Initialize a new item inside a project</p>
              
              <form onSubmit={createTask} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                    Task Title
                  </label>
                  <input
                    required
                    className="bg-zinc-950 border border-zinc-900 rounded-lg p-3 w-full text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500/30 transition-all duration-300 text-sm"
                    placeholder="e.g. Design API Contract"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                    Project Scope
                  </label>
                  <select
                    required
                    className="bg-zinc-950 border border-zinc-900 rounded-lg p-3 w-full text-zinc-100 focus:outline-none focus:border-indigo-500/30 transition-all duration-300 text-sm appearance-none"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="" className="text-zinc-600">-- Select Project --</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 rounded-lg transition-all duration-300 transform active:scale-95 disabled:opacity-50 text-sm shadow-lg shadow-indigo-500/10"
                >
                  {loading ? "Creating..." : "Create Task"}
                </button>
              </form>
            </section>
          </div>

          {/* Tasks List Card */}
          <section className="lg:col-span-2 space-y-6">
            
            {/* Header controls (Filters and Search) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Tab Filters */}
              <div className="flex border border-zinc-900 rounded-lg p-1 bg-zinc-900/10 backdrop-blur">
                {["All", "Pending", "In Progress", "Completed"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`text-[10px] sm:text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
                      statusFilter === filter
                        ? "bg-indigo-500 text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Text Search Field */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-zinc-950 border border-zinc-900 rounded-lg py-2 pl-9 pr-4 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-indigo-500/30 transition-colors w-full sm:w-48"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* List Wrapper */}
            <div className="bg-zinc-900/10 border border-zinc-900 rounded-2xl overflow-hidden">
              
              {apiStatus === "loading" && tasks.length === 0 ? (
                <div className="p-10 text-center text-zinc-500 text-sm">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Loading tasks...
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="p-12 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-zinc-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <p className="text-zinc-500 text-sm font-medium">No matching tasks found.</p>
                  <p className="text-zinc-600 text-xs mt-1">Try resetting filters or search terms.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-900">
                  {filteredTasks.map((task) => (
                    <div
                      key={task._id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-900/10 transition-colors group"
                    >
                      <div className="space-y-1.5 flex-1">
                        <h3 className="font-semibold text-zinc-200 group-hover:text-indigo-400 transition-colors text-sm sm:text-base">
                          {task.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                          <div className="flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-zinc-600" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                            </svg>
                            <span className="font-medium text-zinc-400">
                              {task.projectId?.name || "Unscoped"}
                            </span>
                          </div>
                          <span className="text-zinc-700">•</span>
                          <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Right Control actions */}
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        
                        {/* Status Select Badge */}
                        <div className="relative">
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                            className={`${getStatusBadgeStyle(task.status)} text-xs font-semibold px-3 py-1.5 rounded-lg hover:brightness-110 cursor-pointer focus:outline-none transition-all appearance-none pr-7`}
                          >
                            <option value="Pending" className="bg-zinc-950 text-zinc-400">Pending</option>
                            <option value="In Progress" className="bg-zinc-950 text-indigo-400">In Progress</option>
                            <option value="Completed" className="bg-zinc-950 text-emerald-400">Completed</option>
                          </select>
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>

                        {/* Delete action button */}
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:border-red-500/10 hover:bg-red-500/5 transition-all"
                          title="Delete Task"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          </section>

        </div>
      </main>
      <ChatDrawer />
    </div>
  );
}