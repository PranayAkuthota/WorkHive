import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import TaskPage from "./Pages/TaskPage";

// Wrapper for protected routes (evaluated dynamically on navigation)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

// Wrapper for public-only routes (redirects to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [fadeAway, setFadeAway] = useState(false);

  useEffect(() => {
    // Simulate initial workspace asset configuration and database connection setup
    const timer = setTimeout(() => {
      setFadeAway(true);
      const fadeTimer = setTimeout(() => {
        setIsAppLoading(false);
      }, 700); // Wait for transition animation to complete
      return () => clearTimeout(fadeTimer);
    }, 1800); // 1.8 seconds loading screen
    return () => clearTimeout(timer);
  }, []);

  if (isAppLoading) {
    return (
      <div className={`fixed inset-0 bg-zinc-950 flex flex-col justify-center items-center z-[99999] transition-all duration-700 ease-in-out ${
        fadeAway ? "opacity-0 scale-95 pointer-events-none" : "opacity-100"
      }`}>
        {/* Glow ambient background elements */}
        <div className="absolute w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Glowing Honeycomb Emblem */}
        <div className="relative mb-6 transform hover:scale-105 transition-transform duration-300">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-blue-700 p-[1.5px] shadow-[0_0_50px_rgba(99,102,241,0.2)] flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-400" viewBox="0 0 100 100" fill="none">
                <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="50,38 60,44 60,56 50,62 40,56 40,44" className="stroke-indigo-400" />
                  <path d="M60,20 L70,26 L70,38 L60,44" className="stroke-blue-400" />
                  <path d="M40,44 L30,38 L30,26 L40,20" className="stroke-blue-400" />
                  <path d="M50,62 L50,78 L40,84 L30,78" className="stroke-indigo-500" />
                </g>
                <circle cx="50" cy="50" r="4" fill="#60a5fa" />
              </svg>
            </div>
          </div>
        </div>

        {/* Brand Text */}
        <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-200 to-indigo-400 mb-6 font-sans">
          WORKHIVE
        </h1>

        {/* Loading Spinner & Progress bar */}
        <div className="w-48 bg-zinc-900 h-[3px] rounded-full overflow-hidden relative border border-zinc-800/40">
          <div 
            className="absolute bg-gradient-to-r from-indigo-500 to-blue-500 h-full w-[40%] rounded-full" 
            style={{
              animation: "loading 1.8s infinite ease-in-out"
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskPage />
            </ProtectedRoute>
          }
        />

        {/* Root path landing page */}
        <Route
          path="/"
          element={<Home />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;