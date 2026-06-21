import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("Admin"); // Default portal: Admin, Manager, Member
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password.");
      return;
    }
 
    try {
      setLoading(true);
      console.log("Login clicked");
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
        role: selectedRole
      });
      console.log("Response:", res.data);
      localStorage.setItem("token", res.data.token);
      alert(`${selectedRole} Login Success`);
      navigate("/dashboard");
    } catch (err) {
      console.log("ERROR:", err);
      alert(err.response?.data?.message || err.response?.data?.error || "Login failed");
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-blue-200 to-indigo-400">
            Workhive
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Welcome back to your dashboard</p>
        </div>
 
        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Segmented Role Switcher */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 text-center">
              Choose Login Portal
            </label>
            <div className="flex border border-zinc-800 rounded-lg p-1 bg-zinc-950/60 mb-2">
              {["Admin", "Manager", "Member"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all duration-300 ${
                    selectedRole === r
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/10"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Email Address
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
              Password
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
 
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? "Signing In..." : `Log In as ${selectedRole}`}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-zinc-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline transition-colors duration-200">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}