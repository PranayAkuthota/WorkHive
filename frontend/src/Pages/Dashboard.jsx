import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [name, setName] = useState("");
  const [projects, setProjects] = useState([]);
  const [inviteCode, setInviteCode] = useState("");
  const navigate = useNavigate();

  // Fetch projects when component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("http://localhost:5000/api/projects", {
          headers: { Authorization: token }
        });
        setProjects(res.data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      }
    };
    fetchProjects();
  }, []);

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
  const createProject = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!name.trim()) {
        alert("Please enter a project name");
        return;
      }
      await axios.post(
        "http://localhost:5000/api/projects",
        { name },
        { headers: { Authorization: token } }
      );
      alert("Project created");
      setName("");

      // Refresh projects list
      const res = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: token }
      });
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to create project:", err);
      alert("Failed to create project");
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="p-6">
      {/* Header with title and logout button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Display invite code for team sharing */}
      {inviteCode && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6">
          <p className="font-semibold">Team Invite Code:</p>
          <code className="text-lg font-mono bg-white px-2 py-1 rounded border">
            {inviteCode}
          </code>
          <p className="text-sm text-gray-600 mt-1">
            Share this code with new team members to join your organization.
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(inviteCode);
              alert("Invite code copied to clipboard!");
            }}
            className="mt-2 text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
          >
            Copy Code
          </button>
        </div>
      )}

      {/* Create Project form */}
      <div className="mb-6">
        <input
          className="border p-2 mr-2"
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={createProject}
        >
          Create Project
        </button>
      </div>

      {/* List of projects */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Projects</h2>
        {projects.length === 0 ? (
          <p className="text-gray-500">No projects yet. Create one above.</p>
        ) : (
          projects.map((p) => (
            <div key={p._id} className="bg-gray-100 p-3 mt-2 rounded shadow">
              {p.name}
            </div>
          ))
        )}
      </div>

      {/* Navigate to Tasks */}
      <button
        className="bg-purple-500 text-white px-4 py-2 rounded"
        onClick={() => navigate("/tasks")}
      >
        Go to Tasks
      </button>
    </div>
  );
}