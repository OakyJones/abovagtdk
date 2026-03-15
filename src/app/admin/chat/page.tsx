"use client";

import { useState, useEffect, useRef } from "react";

interface ChatMessage {
  id: string;
  sender: "jonas" | "mik";
  message: string;
  created_at: string;
  read_by_mik: boolean;
  mik_action_taken: string | null;
  mik_action_result: string | null;
}

export default function AdminChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/chat");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // silently fail
    }
  };

  // Initial fetch + polling every 10s
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (res.ok) {
        setInput("");
        await fetchMessages();
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    } catch {
      // silently fail
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("da-DK", { day: "numeric", month: "short" });
  };

  // Group messages by date
  let lastDate = "";

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 180px)" }}>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Chat med Mik</h2>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Ingen beskeder endnu. Skriv til Mik!
          </div>
        )}

        {messages.map((msg) => {
          const msgDate = formatDate(msg.created_at);
          let showDate = false;
          if (msgDate !== lastDate) {
            showDate = true;
            lastDate = msgDate;
          }

          const isJonas = msg.sender === "jonas";

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="text-center my-4">
                  <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                    {msgDate}
                  </span>
                </div>
              )}
              <div className={`flex mb-3 ${isJonas ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] ${isJonas ? "items-end" : "items-start"}`}>
                  {/* Name label */}
                  <p className={`text-[10px] font-semibold mb-0.5 ${
                    isJonas ? "text-right text-gray-400" : "text-left text-[#4ECDC4]"
                  }`}>
                    {isJonas ? "Jonas" : "Mik"}
                  </p>

                  {/* Message bubble */}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      isJonas
                        ? "bg-[#1B7A6E] text-white rounded-br-md"
                        : "bg-[#F3F4F6] text-[#1C2B2A] rounded-bl-md"
                    }`}
                  >
                    {msg.message}
                  </div>

                  {/* Action badge */}
                  {msg.mik_action_taken && (
                    <div className={`mt-1 ${isJonas ? "text-right" : "text-left"}`}>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#1B7A6E] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {msg.mik_action_taken}
                      </span>
                      {msg.mik_action_result && (
                        <span className="ml-1 text-[10px] text-gray-400">{msg.mik_action_result}</span>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className={`text-[10px] text-gray-400 mt-0.5 ${
                    isJonas ? "text-right" : "text-left"
                  }`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3 flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            // Auto-resize
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
          onKeyDown={handleKeyDown}
          placeholder="Skriv til Mik..."
          rows={1}
          className="flex-1 resize-none border-0 focus:ring-0 focus:outline-none text-sm text-gray-900 placeholder-gray-400 py-2"
          style={{ minHeight: "36px", maxHeight: "120px" }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="shrink-0 px-4 py-2 bg-[#1B7A6E] text-white text-sm font-semibold rounded-xl hover:bg-[#155F56] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
