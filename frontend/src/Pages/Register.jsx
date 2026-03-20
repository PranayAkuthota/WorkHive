import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState(""); // <-- new state
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const payload = { name, email, password };
      if (inviteCode.trim()) payload.inviteCode = inviteCode; // include only if provided

      const res = await axios.post("http://localhost:5000/api/auth/register", payload);
      alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Registration failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl mb-4 text-center">Register</h2>

        <input
          className="border p-2 mb-3 w-full"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2 mb-3 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 mb-3 w-full"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className="border p-2 mb-3 w-full"
          placeholder="Invite Code (optional, if joining a team)"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
        />

        <button
          className="bg-green-500 text-white w-full py-2 rounded"
          onClick={handleRegister}
        >
          Register
        </button>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}