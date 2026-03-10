"use client";

import { useState, useEffect, useCallback } from "react";

interface InboundEmail {
  id: string;
  from_email: string;
  to_email: string;
  subject: string;
  body_html: string | null;
  body_text: string | null;
  tag: string;
  is_read: boolean;
  received_at: string;
}

const tagConfig: Record<string, { label: string; color: string }> = {
  support: { label: "Support", color: "bg-red-100 text-red-700" },
  general: { label: "Generelt", color: "bg-blue-100 text-blue-700" },
  other: { label: "Andet", color: "bg-gray-100 text-gray-600" },
};

export default function InboxPage() {
  const [emails, setEmails] = useState<InboundEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string>("all");

  const fetchEmails = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/inbox");
      if (res.ok) {
        const data = await res.json();
        setEmails(data.emails || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const markAsRead = async (id: string) => {
    setSelectedId(id);
    // Mark as read
    const email = emails.find((e) => e.id === id);
    if (email && !email.is_read) {
      await fetch("/api/admin/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_read: true }),
      });
      setEmails((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_read: true } : e))
      );
    }
  };

  const selectedEmail = emails.find((e) => e.id === selectedId);

  const filteredEmails =
    filterTag === "all" ? emails : emails.filter((e) => e.tag === filterTag);

  const unreadCount = emails.filter((e) => !e.is_read).length;
  const tagCounts = emails.reduce<Record<string, number>>((acc, e) => {
    acc[e.tag] = (acc[e.tag] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400 text-sm">Henter emails...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Indbakke</h2>
          <p className="text-sm text-gray-500">
            {emails.length} email{emails.length !== 1 ? "s" : ""}{" "}
            {unreadCount > 0 && (
              <span className="text-[#1B7A6E] font-medium">
                ({unreadCount} ulæst{unreadCount !== 1 ? "e" : ""})
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchEmails}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Opdater
        </button>
      </div>

      {/* Tag filters */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilterTag("all")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
            filterTag === "all"
              ? "bg-[#1C2B2A] text-white border-[#1C2B2A]"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          Alle ({emails.length})
        </button>
        {Object.entries(tagConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilterTag(key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              filterTag === key
                ? "bg-[#1C2B2A] text-white border-[#1C2B2A]"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {config.label} ({tagCounts[key] || 0})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Email list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {filteredEmails.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-400 text-sm">
                Ingen emails endnu
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {filteredEmails.map((email) => (
                  <button
                    key={email.id}
                    onClick={() => markAsRead(email.id)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      selectedId === email.id
                        ? "bg-teal-50 border-l-2 border-[#1B7A6E]"
                        : email.is_read
                        ? "hover:bg-gray-50"
                        : "bg-blue-50/30 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm truncate ${
                            email.is_read
                              ? "text-gray-600"
                              : "text-gray-900 font-semibold"
                          }`}
                        >
                          {email.from_email}
                        </p>
                        <p
                          className={`text-sm truncate mt-0.5 ${
                            email.is_read
                              ? "text-gray-500"
                              : "text-gray-800 font-medium"
                          }`}
                        >
                          {email.subject || "(Intet emne)"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">
                            {new Date(email.received_at).toLocaleDateString(
                              "da-DK",
                              {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                          <span
                            className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                              tagConfig[email.tag]?.color || tagConfig.other.color
                            }`}
                          >
                            {tagConfig[email.tag]?.label || email.tag}
                          </span>
                        </div>
                      </div>
                      {!email.is_read && (
                        <div className="w-2 h-2 rounded-full bg-[#1B7A6E] mt-2 shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Email detail */}
        <div className="lg:col-span-3">
          {selectedEmail ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedEmail.subject || "(Intet emne)"}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  <span>
                    <span className="text-gray-400">Fra:</span>{" "}
                    <span className="text-gray-700 font-medium">
                      {selectedEmail.from_email}
                    </span>
                  </span>
                  <span>
                    <span className="text-gray-400">Til:</span>{" "}
                    <span className="text-gray-700">{selectedEmail.to_email}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400">
                    {new Date(selectedEmail.received_at).toLocaleDateString(
                      "da-DK",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      tagConfig[selectedEmail.tag]?.color ||
                      tagConfig.other.color
                    }`}
                  >
                    {tagConfig[selectedEmail.tag]?.label || selectedEmail.tag}
                  </span>
                </div>
              </div>
              <div className="px-6 py-4 max-h-[500px] overflow-y-auto">
                {selectedEmail.body_html ? (
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: selectedEmail.body_html,
                    }}
                  />
                ) : selectedEmail.body_text ? (
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {selectedEmail.body_text}
                  </pre>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    Ingen indhold i denne email
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center py-20">
              <div className="text-center text-gray-400">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm">Vælg en email for at læse den</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
