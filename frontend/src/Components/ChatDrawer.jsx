import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";

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

export default function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const socketRef = useRef(null);
  const [currentUserId] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = decodeToken(token);
    return decoded?.userId || null;
  });
  const messageEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle socket connection and chat history fetch
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Fetch message history
    const fetchHistory = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/chat/history", {
          headers: { Authorization: token },
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    fetchHistory();

    // Establish WebSocket connection
    const newSocket = io("http://localhost:5000", {
      auth: { token },
    });

    newSocket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current = newSocket;

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!content.trim() || !socketRef.current) return;

    socketRef.current.emit("send_message", { content });
    setContent("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold px-4 py-3 rounded-full shadow-2xl hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-300 transform active:scale-95 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-950 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-xs tracking-wider uppercase">Colleague Chat</span>
        </button>
      )}

      {/* Floating Chat Window Panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[480px] bg-zinc-950/90 border border-zinc-800/80 backdrop-blur-2xl rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-6 fade-in-20">
          
          {/* Header */}
          <header className="bg-zinc-900/60 border-b border-zinc-900 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="font-bold text-sm tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-amber-300">
                Colleague Workspace
              </h3>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-zinc-300 p-1 hover:bg-zinc-900 rounded-lg transition-colors"
              title="Minimize Chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          {/* Messages Log area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scroll">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <p className="text-xs text-zinc-500">No updates yet.</p>
                <p className="text-[10px] text-zinc-600 mt-1 leading-relaxed">
                  Type a message below to broadcast your status to teammates.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isSelf = msg.senderId?._id === currentUserId || msg.senderId === currentUserId;
                const senderName = msg.senderId?.name || "Colleague";
                
                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col max-w-[85%] ${
                      isSelf ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    {/* Sender label (only if not self) */}
                    {!isSelf && (
                      <span className="text-[10px] font-bold text-amber-500/80 mb-1 ml-1 uppercase tracking-wider">
                        {senderName}
                      </span>
                    )}

                    {/* Chat Bubble bubble */}
                    <div
                      className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${
                        isSelf
                          ? "bg-amber-500 text-zinc-950 rounded-tr-none font-medium shadow-lg shadow-amber-500/5"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none"
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Timestamp */}
                    <span className="text-[9px] text-zinc-600 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messageEndRef} />
          </div>

          {/* Input form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-zinc-900 bg-zinc-950 flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder="Post a workspace status..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-zinc-900 border border-zinc-850 rounded-lg py-2 px-3 flex-1 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500/30 transition-colors"
            />
            <button
              type="submit"
              disabled={!content.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold w-8 h-8 rounded-lg flex items-center justify-center transition-all transform active:scale-95 flex-shrink-0"
              title="Post Update"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
