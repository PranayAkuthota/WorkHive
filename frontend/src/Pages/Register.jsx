import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const payload = { name, email, password };
      if (inviteCode.trim()) payload.inviteCode = inviteCode;

      await axios.post("http://localhost:5000/api/auth/register", payload);
      alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Registration failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center items-center bg-zinc-950 relative overflow-hidden px-4">
      {/* Background Decorative Sapphire Glows */}
      <div className="absolute w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] -top-24 -left-20 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[120px] -bottom-24 -right-20 pointer-events-none" />

      {/* Card Container */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl p-8 rounded-2xl w-full max-w-md shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-blue-200 to-indigo-400">
            Workhive
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Create your multi-tenant workspace</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              className="bg-zinc-950/80 border border-zinc-800/80 rounded-lg p-3 w-full text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300"
              placeholder="Alex Mercer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Email Address *
            </label>
            <input
              type="email"
              required
              className="bg-zinc-950/80 border border-zinc-800/80 rounded-lg p-3 w-full text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Password *
            </label>
            <input
              type="password"
              required
              className="bg-zinc-950/80 border border-zinc-800/80 rounded-lg p-3 w-full text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Invite Code <span className="text-zinc-600">(Optional)</span>
            </label>
            <input
              type="text"
              className="bg-zinc-950/80 border border-zinc-800/80 rounded-lg p-3 w-full text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300 font-mono text-sm tracking-widest"
              placeholder="Leave blank to create new org"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline transition-colors duration-200">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}