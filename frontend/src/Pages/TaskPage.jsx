import { useState, useEffect } from "react";
import axios from "axios";

export default function TaskPage() {
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState("idle"); // idle, loading, success, error

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
      // Don't show error to user, just log
    }
  };

  useEffect(() => {
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

      alert("Task created successfully!");
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

  // Delete task handler (optional)
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

  // Update task status (optional)
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

  // If there's a critical error, show it with retry button
  if (apiStatus === "error" && error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold">Error Loading Tasks</h2>
          <p>{error}</p>
          <button 
            onClick={fetchTasks}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tasks</h1>

      {/* Create Task Form */}
      <form onSubmit={createTask} className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
        <div className="flex flex-col gap-4">
          <input
            className="border p-3 rounded-lg"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />

          <select
            className="border p-3 rounded-lg"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Select a Project --</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name} {project.description ? `- ${project.description}` : ''}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold p-6 border-b">Task List</h2>
        
        {apiStatus === "loading" && tasks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No tasks yet. Create your first task above!
          </div>
        ) : (
          <div className="divide-y">
            {tasks.map((task) => (
              <div key={task._id} className="p-6 flex justify-between items-center hover:bg-gray-50">
                <div className="flex-1">
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-500">
                    Project: {task.projectId?.name || task.projectId} | Status: {task.status}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Status Dropdown */}
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete task"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}