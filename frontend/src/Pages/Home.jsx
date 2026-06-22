import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const [isLoggedIn] = useState(() => {
    return !!localStorage.getItem("token");
  });
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-indigo-500/20 selection:text-indigo-200">
      
      {/* Background Decorative Blur Gradients */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] -top-24 -left-20 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] top-[30%] right-[-100px] pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[140px] -bottom-24 left-[20%] pointer-events-none" />

      {/* Navigation Header */}
      <header className="w-full border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 p-[1.5px] shadow-lg shadow-indigo-500/10 flex items-center justify-center">
              <div className="w-full h-full bg-zinc-950 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-indigo-400 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 100 100" fill="none">
                  <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="50,38 60,44 60,56 50,62 40,56 40,44" />
                    <path d="M60,20 L70,26 L70,38 L60,44" />
                    <path d="M40,44 L30,38 L30,26 L40,20" />
                    <path d="M50,62 L50,78 L40,84 L30,78" />
                  </g>
                  <circle cx="50" cy="50" r="4" fill="#60a5fa" />
                </svg>
              </div>
            </div>
            <span className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-indigo-300">
              Workhive
            </span>
          </Link>

          {/* Nav Items (Center) - Grayscale hover */}
          <nav className="hidden md:flex items-center gap-8">
            {["Products", "Solutions", "Enterprise", "Pricing"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                onClick={(e) => e.preventDefault()}
                className="text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors duration-200"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* CTA Buttons (Right) */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100 text-sm font-semibold transition-all duration-300 shadow-md active:scale-95"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white text-sm font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-95"
                >
                  Start Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl mx-auto px-6 w-full py-16 lg:py-24 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Sales Pitch Copy */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Collaborative Dev Workspace
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-200 to-indigo-300">
              The modern workspace for coding agents and teams.
            </h1>

            <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Workhive streamlines task management, projects, and real-time messaging into a cohesive workspace. Programmed for speed, styled for high-end luxury.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => navigate(isLoggedIn ? "/dashboard" : "/register")}
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-semibold text-sm transition-all duration-300 shadow-xl shadow-indigo-500/15 hover:shadow-indigo-500/25 active:scale-95"
              >
                {isLoggedIn ? "Access Workspace" : "Get Started Now"}
              </button>
              <button
                onClick={() => alert("Demo request received! Our team will contact you shortly.")}
                className="w-full sm:w-auto px-8 py-3 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/50 text-zinc-300 font-semibold text-sm transition-all duration-300 active:scale-95"
              >
                Talk to Sales
              </button>
            </div>
          </div>

          {/* Right Column: Giant Floating Honeycomb Logo */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            {/* Center soft glow behind logo */}
            <div className="absolute w-72 h-72 bg-indigo-500/10 rounded-full blur-[70px] pointer-events-none" />

            {/* Giant rotating/floating custom honeycomb structure */}
            <div 
              className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-[2.5rem] bg-gradient-to-br from-zinc-900/40 via-zinc-950/20 to-zinc-900/50 border border-zinc-800/80 backdrop-blur-2xl p-6 shadow-2xl flex items-center justify-center relative group cursor-pointer hover:border-indigo-500/30 transition-all duration-700 hover:shadow-[0_0_50px_rgba(99,102,241,0.15)]"
              style={{
                animation: "float 6s ease-in-out infinite"
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-2/3 h-2/3 text-indigo-400/90 group-hover:scale-105 transition-transform duration-700 filter drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]" 
                viewBox="0 0 100 100" 
                fill="none"
              >
                {/* Honeycomb Gradients */}
                <defs>
                  <linearGradient id="landingHoneyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#a5b4fc" />
                    <stop offset="50%" stop-color="#60a5fa" />
                    <stop offset="100%" stop-color="#3b82f6" />
                  </linearGradient>
                </defs>

                <g fill="none" stroke="url(#landingHoneyGrad)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                  {/* Hexagon nodes */}
                  <polygon points="50,38 60,44 60,56 50,62 40,56 40,44" className="opacity-95" />
                  <path d="M60,20 L70,26 L70,38 L60,44" className="opacity-80" />
                  <path d="M40,44 L30,38 L30,26 L40,20" className="opacity-80" />
                  <path d="M50,62 L50,78 L40,84 L30,78" className="opacity-70" />
                </g>
                <circle cx="50" cy="50" r="4.5" fill="#93c5fd" />
              </svg>

              {/* Decorative mini ambient elements inside the card */}
              <div className="absolute top-6 left-6 text-[10px] font-mono text-zinc-600 tracking-wider">SECURE TENANT</div>
              <div className="absolute bottom-6 right-6 text-[10px] font-mono text-indigo-500/80 font-bold tracking-widest uppercase">WORKHIVE v1.2</div>
            </div>
          </div>

        </div>
      </main>

      {/* Grayscale Client/Partner Logos Bar (Bottom) */}
      <footer className="w-full border-t border-zinc-900 bg-zinc-950 py-10 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] sm:text-xs font-bold text-zinc-600 tracking-[0.2em] uppercase mb-8">
            Trusted by modern engineering & design teams at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-40 grayscale contrast-200">
            {/* Stripe Mock */}
            <div className="flex items-center gap-1.5 text-zinc-400 font-extrabold text-sm sm:text-base tracking-tight font-sans">
              stripe
            </div>
            {/* OpenAI Mock */}
            <div className="flex items-center gap-1.5 text-zinc-400 font-extrabold text-sm sm:text-base tracking-tight font-sans">
              OpenAI
            </div>
            {/* Linear Mock */}
            <div className="flex items-center gap-1.5 text-zinc-400 font-extrabold text-sm sm:text-base tracking-tight font-sans">
              Linear
            </div>
            {/* Vercel Mock */}
            <div className="flex items-center gap-1.5 text-zinc-400 font-extrabold text-sm sm:text-base tracking-tight font-sans">
              ▲ Vercel
            </div>
            {/* Slack Mock */}
            <div className="flex items-center gap-1.5 text-zinc-400 font-extrabold text-sm sm:text-base tracking-tight font-sans">
              slack
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Animation Rules (Embedded directly) */}
      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-12px) rotate(1deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
