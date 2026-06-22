import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import ChatDrawer from "../Components/ChatDrawer";

// Helper to decode JWT token
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

export default function CodeWorkspace() {
  const [snippets, setSnippets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeSnippet, setActiveSnippet] = useState(null);
  
  // Editor & Sandbox states
  const [editorTitle, setEditorTitle] = useState("");
  const [editorCode, setEditorCode] = useState("");
  const [editorLang, setEditorLang] = useState("javascript");
  const [editorProj, setEditorProj] = useState("");
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [htmlPreviewUrl, setHtmlPreviewUrl] = useState("");
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLang, setFilterLang] = useState("all");
  const [filterProj, setFilterProj] = useState("all");
  
  // UI states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLang, setNewLang] = useState("javascript");
  const [newProj, setNewProj] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [rightTab, setRightTab] = useState("console"); // "console" | "preview"
  
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  // Role extraction
  const [role] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return "Member";
    const decoded = decodeToken(token);
    return decoded?.role || "Member";
  });
  
  // User ID extraction to restrict deletion/modification
  const [currentUserId] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = decodeToken(token);
    return decoded?.userId || null;
  });

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  // Fetch projects list
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
      if (err.response?.status === 401) handleLogout();
    }
  }, [handleLogout]);

  // Fetch snippets
  const fetchSnippets = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("http://localhost:5000/api/snippets", {
        headers: { Authorization: token }
      });
      setSnippets(res.data);
      if (res.data.length > 0 && !activeSnippet) {
        // Set first snippet as active
        selectSnippet(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch snippets:", err);
    } finally {
      setLoading(false);
    }
  }, [activeSnippet]);

  useEffect(() => {
    fetchProjects();
    fetchSnippets();
  }, [fetchProjects, fetchSnippets]);

  // Select a snippet
  const selectSnippet = (snippet) => {
    setActiveSnippet(snippet);
    setEditorTitle(snippet.title);
    setEditorCode(snippet.code);
    setEditorLang(snippet.language);
    setEditorProj(snippet.projectId?._id || "");
    setConsoleOutput([]);
    setHtmlPreviewUrl("");
    if (snippet.language === "html") {
      setRightTab("preview");
    } else {
      setRightTab("console");
    }
  };

  // Create snippet
  const handleCreateSnippet = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert("Please enter a title");
      return;
    }
    
    // Default starter template codes
    let starterCode = "// Write code here...\n";
    if (newLang === "html") {
      starterCode = `<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { background: #09090b; color: #f4f4f5; font-family: sans-serif; padding: 20px; }\n    h1 { color: #6366f1; }\n  </style>\n</head>\n<body>\n  <h1>Hello Workhive!</h1>\n  <p>Modify this markup to see live changes.</p>\n</body>\n</html>`;
    } else if (newLang === "css") {
      starterCode = `/* CSS Styles */\nbody {\n  background-color: #0f172a;\n  color: #e2e8f0;\n}`;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/snippets", {
        title: newTitle.trim(),
        language: newLang,
        code: starterCode,
        projectId: newProj || undefined
      }, {
        headers: { Authorization: token }
      });
      
      setSnippets([res.data, ...snippets]);
      selectSnippet(res.data);
      setIsNewModalOpen(false);
      setNewTitle("");
      setNewProj("");
      alert("Snippet created successfully!");
    } catch (err) {
      console.error("Create snippet error:", err);
      alert(err.response?.data?.message || "Failed to create snippet");
    }
  };

  // Save current snippet code
  const handleSaveSnippet = async () => {
    if (!activeSnippet) return;
    try {
      setSaveLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/api/snippets/${activeSnippet._id}`, {
        title: editorTitle,
        code: editorCode,
        language: editorLang,
        projectId: editorProj || undefined
      }, {
        headers: { Authorization: token }
      });
      
      // Update local snippet list
      setSnippets(snippets.map(s => s._id === res.data._id ? res.data : s));
      setActiveSnippet(res.data);
      alert("Snippet saved successfully!");
    } catch (err) {
      console.error("Save snippet error:", err);
      alert(err.response?.data?.message || "Failed to save snippet");
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete snippet
  const handleDeleteSnippet = async (id) => {
    if (!window.confirm("Are you sure you want to delete this snippet?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/snippets/${id}`, {
        headers: { Authorization: token }
      });
      const filtered = snippets.filter(s => s._id !== id);
      setSnippets(filtered);
      if (activeSnippet?._id === id) {
        if (filtered.length > 0) {
          selectSnippet(filtered[0]);
        } else {
          setActiveSnippet(null);
          setEditorTitle("");
          setEditorCode("");
          setEditorLang("javascript");
          setEditorProj("");
        }
      }
      alert("Snippet deleted successfully!");
    } catch (err) {
      console.error("Delete snippet error:", err);
      alert(err.response?.data?.message || "Failed to delete snippet");
    }
  };

  // Run snippet code (eval for JS, iframe srcDoc for HTML)
  const handleRunCode = () => {
    if (editorLang === "javascript") {
      setRightTab("console");
      setConsoleOutput(["⚙️ Executing script..."]);
      
      const outputs = [];
      const customConsole = {
        log: (...args) => {
          outputs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' '));
        },
        error: (...args) => {
          outputs.push("❌ Error: " + args.join(' '));
        },
        warn: (...args) => {
          outputs.push("⚠️ Warning: " + args.join(' '));
        }
      };

      try {
        // Safe evaluation wrapper
        const runner = new Function('console', editorCode);
        runner(customConsole);
        
        if (outputs.length === 0) {
          setConsoleOutput(["⚙️ Executing script...", "👉 Execution finished with no console outputs."]);
        } else {
          setConsoleOutput(["⚙️ Executing script...", ...outputs]);
        }
      } catch (err) {
        setConsoleOutput(["⚙️ Executing script...", `❌ Exception: ${err.message}`]);
      }
    } else if (editorLang === "html") {
      setRightTab("preview");
      setHtmlPreviewUrl(editorCode);
    } else {
      setRightTab("console");
      setConsoleOutput([`👉 Execution preview is not supported for ${editorLang.toUpperCase()}. Click Save to store snippet changes.`]);
    }
  };

  // Filter snippets based on query and drop-downs
  const filteredSnippets = snippets.filter(s => {
    const matchesSearch = s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.createdBy?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = filterLang === "all" || s.language === filterLang;
    const matchesProj = filterProj === "all" || s.projectId?._id === filterProj;
    return matchesSearch && matchesLang && matchesProj;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row font-sans relative overflow-x-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] top-10 left-10 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[140px] bottom-10 right-10 pointer-events-none" />

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-zinc-900/40 border-b md:border-b-0 md:border-r border-zinc-900 backdrop-blur-xl flex flex-col justify-between p-6 z-10">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 100 100" fill="none">
                <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="50,38 60,44 60,56 50,62 40,56 40,44" />
                  <path d="M60,20 L70,26 L70,38 L60,44" />
                  <path d="M40,44 L30,38 L30,26 L40,20" />
                  <path d="M50,62 L50,78 L40,84 L30,78" />
                </g>
                <circle cx="50" cy="50" r="4" fill="#60a5fa" />
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
              className="flex items-center gap-3 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 px-4 py-2.5 rounded-lg transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Tasks
            </Link>

            <Link
              to="/workspace"
              className="flex items-center gap-3 font-medium px-4 py-2.5 rounded-lg border bg-indigo-500/10 text-indigo-400 border-indigo-500/20 transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Workspace
            </Link>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 pt-6 border-t border-zinc-900">
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

      {/* Main Workspace Layout Wrapper */}
      <div className="flex-1 flex flex-col lg:flex-row z-10 overflow-hidden">
        
        {/* Sub-Panel: Snippet Explorer Sidebar (Left) */}
        <div className="w-full lg:w-80 bg-zinc-950 border-r border-zinc-900 flex flex-col h-full lg:h-screen">
          <div className="p-4 border-b border-zinc-900 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Snippets</h2>
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-indigo-500/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                New
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Search snippets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900 border border-zinc-900 rounded-lg px-3 py-2 w-full text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500/30"
            />
            
            {/* Quick Filters */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filterLang}
                onChange={(e) => setFilterLang(e.target.value)}
                className="bg-zinc-900 border border-zinc-900 rounded text-[10px] p-1.5 focus:outline-none text-zinc-400"
              >
                <option value="all">All Languages</option>
                <option value="javascript">JavaScript</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
              </select>

              <select
                value={filterProj}
                onChange={(e) => setFilterProj(e.target.value)}
                className="bg-zinc-900 border border-zinc-900 rounded text-[10px] p-1.5 focus:outline-none text-zinc-400"
              >
                <option value="all">All Projects</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Snippet List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/50">
            {loading ? (
              <div className="p-8 text-center text-zinc-600 text-xs">Loading workspace files...</div>
            ) : filteredSnippets.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-xs">No snippets found in organization.</div>
            ) : (
              filteredSnippets.map((snippet) => (
                <button
                  key={snippet._id}
                  onClick={() => selectSnippet(snippet)}
                  className={`w-full text-left p-4 hover:bg-zinc-900/20 transition-colors flex flex-col gap-1.5 ${
                    activeSnippet?._id === snippet._id ? "bg-zinc-900/30 border-l-2 border-indigo-500" : ""
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-xs text-zinc-200 truncate pr-2">{snippet.title}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      snippet.language === "javascript"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : snippet.language === "html"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}>
                      {snippet.language === "javascript" ? "js" : snippet.language}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span>By {snippet.createdBy?.name || "Unknown"}</span>
                    <span>{snippet.projectId?.name || "Global"}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Center Panel: Code Editor (IDE Interface) */}
        <div className="flex-1 flex flex-col bg-zinc-950 border-r border-zinc-900 h-full lg:h-screen relative">
          {activeSnippet ? (
            <>
              {/* Editor Header Details */}
              <div className="p-4 border-b border-zinc-900 flex flex-wrap items-center justify-between gap-4 bg-zinc-950">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    className="bg-transparent text-sm font-bold text-zinc-100 border-b border-transparent focus:border-indigo-500/40 focus:outline-none transition-all px-1"
                  />
                  <span className="text-zinc-700 text-xs">|</span>
                  
                  {/* Scope Selector */}
                  <select
                    value={editorProj}
                    onChange={(e) => setEditorProj(e.target.value)}
                    className="bg-zinc-900/60 border border-zinc-900 rounded text-xs px-2 py-1 text-zinc-400 focus:outline-none"
                  >
                    <option value="">Global Project</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>

                  {/* Language Selector */}
                  <select
                    value={editorLang}
                    onChange={(e) => setEditorLang(e.target.value)}
                    className="bg-zinc-900/60 border border-zinc-900 rounded text-xs px-2 py-1 text-zinc-400 focus:outline-none"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunCode}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-emerald-500/10 flex items-center gap-1.5 transition-all duration-300"
                    title="Execute sandbox code"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Run Code
                  </button>

                  <button
                    onClick={handleSaveSnippet}
                    disabled={saveLoading}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-500/10 flex items-center gap-1.5 transition-all"
                  >
                    {saveLoading ? "Saving..." : "Save"}
                  </button>

                  {(activeSnippet.createdBy?._id === currentUserId || role === "Admin" || role === "Manager") && (
                    <button
                      onClick={() => handleDeleteSnippet(activeSnippet._id)}
                      className="p-1.5 border border-red-500/20 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                      title="Delete Snippet"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* IDE Editor Container with dynamic line numbers */}
              <div className="flex-1 flex overflow-hidden font-mono text-sm relative">
                
                {/* Gutter Line Numbers */}
                <div className="w-12 bg-zinc-950/80 text-zinc-700 text-right pr-3 select-none py-4 border-r border-zinc-900/60 font-mono text-xs leading-6">
                  {editorCode.split("\n").map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                
                <textarea
                  ref={textareaRef}
                  value={editorCode}
                  onChange={(e) => setEditorCode(e.target.value)}
                  className="flex-1 bg-zinc-950/40 text-zinc-300 p-4 focus:outline-none resize-none overflow-y-auto leading-6 font-mono text-xs w-full caret-indigo-500"
                  placeholder="// Write code snippet here..."
                  spellCheck="false"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-10 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-zinc-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="font-semibold text-zinc-400 text-sm">No snippet selected</h3>
              <p className="text-xs text-zinc-600 mt-1 max-w-sm">Create a new snippet or select an existing file from the directory to start coding.</p>
            </div>
          )}
        </div>

        {/* Right Panel: Output Sandbox Console & Dynamic Web Preview */}
        <div className="w-full lg:w-96 bg-zinc-950 flex flex-col h-full lg:h-screen border-t lg:border-t-0 border-zinc-900">
          
          {/* Tab Selection */}
          <div className="flex border-b border-zinc-900 bg-zinc-950 p-1">
            <button
              onClick={() => setRightTab("console")}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all duration-300 ${
                rightTab === "console"
                  ? "bg-zinc-900 text-indigo-400 border border-zinc-800"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Console Output
            </button>
            <button
              onClick={() => setRightTab("preview")}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all duration-300 ${
                rightTab === "preview"
                  ? "bg-zinc-900 text-indigo-400 border border-zinc-800"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Web Preview
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative bg-zinc-950">
            {rightTab === "console" ? (
              /* Hacker terminal console */
              <div className="w-full h-full p-4 bg-[#050508] font-mono text-xs text-emerald-400 overflow-y-auto space-y-2 select-text selection:bg-emerald-500/20">
                {consoleOutput.length === 0 ? (
                  <span className="text-zinc-600">Console is idle. Write JavaScript and click "Run Code" to view executions.</span>
                ) : (
                  consoleOutput.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap leading-relaxed">
                      {log}
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Interactive sandboxed dynamic preview iframe */
              <div className="w-full h-full bg-white relative">
                {htmlPreviewUrl ? (
                  <iframe
                    title="HTML Preview Sandbox"
                    sandbox="allow-scripts"
                    srcDoc={htmlPreviewUrl}
                    className="w-full h-full border-none bg-white"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#050508] flex items-center justify-center text-center p-6">
                    <p className="text-xs text-zinc-600">Preview is idle. Select or create an HTML snippet and click "Run Code" to preview page structures.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* NEW SNIPPET MODAL DIALOG */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-indigo-300 mb-4">
              Create New Snippet
            </h3>
            
            <form onSubmit={handleCreateSnippet} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                  Snippet Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 w-full text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500/30 text-xs"
                  placeholder="e.g. arrayHelper.js"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Language *
                  </label>
                  <div className="relative">
                    <select
                      value={newLang}
                      onChange={(e) => setNewLang(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg p-2.5 w-full focus:outline-none focus:border-indigo-500/30 text-xs appearance-none pr-8 cursor-pointer"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
                    Project association
                  </label>
                  <div className="relative">
                    <select
                      value={newProj}
                      onChange={(e) => setNewProj(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg p-2.5 w-full focus:outline-none focus:border-indigo-500/30 text-xs appearance-none pr-8 cursor-pointer"
                    >
                      <option value="">Global Project</option>
                      {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-zinc-800 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-indigo-500/10"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Isolated chat support */}
      <ChatDrawer />
    </div>
  );
}
