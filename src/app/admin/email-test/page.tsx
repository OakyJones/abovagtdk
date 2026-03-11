"use client";

import { useState } from "react";

const emailTypes = [
  { value: "quiz-result", label: "Quiz resultat-email" },
  { value: "cancel-preview", label: "Opsigelsesmail (preview)" },
  { value: "downgrade-preview", label: "Nedgraderingsmail (preview)" },
  { value: "winback-day3", label: "Win-back drip (dag 3)" },
  { value: "welcome", label: "Velkommen/bekræftelse" },
] as const;

interface SendResult {
  success?: boolean;
  error?: string;
  messageId?: string;
  type?: string;
  to?: string;
  subject?: string;
}

interface DnsRecord {
  status: string;
  name: string;
  value: string;
}

interface HealthResult {
  domain?: string;
  status?: string;
  region?: string;
  createdAt?: string;
  error?: string;
  senderInfo?: {
    from: string;
    replyTo: string;
    noreply: string;
  };
  dns?: {
    spf: DnsRecord;
    dkim: DnsRecord[];
    dmarc: DnsRecord;
  };
  allRecords?: {
    record: string;
    type: string;
    name: string;
    status: string;
    value: string;
  }[];
}

function StatusBadge({ status }: { status: string }) {
  const isVerified = status === "verified" || status === "valid";
  const isPending = status === "pending";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
        isVerified
          ? "bg-green-100 text-green-700"
          : isPending
          ? "bg-yellow-100 text-yellow-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {isVerified ? "✅" : isPending ? "⏳" : "❌"} {status}
    </span>
  );
}

interface DiagResult {
  timestamp?: string;
  tableCounts?: Record<string, { count: number | null; error: string | null; sample: unknown }>;
  recentInbound?: { id: string; from_email: string; subject: string; direction: string; received_at: string }[];
  recentUsers?: { id: string; email: string; created_at: string }[];
  env?: Record<string, unknown>;
  error?: string;
}

interface SimulateResult {
  success?: boolean;
  error?: string;
  id?: string;
  message?: string;
}

export default function EmailTestPage() {
  const [to, setTo] = useState("hej@abovagt.dk");
  const [emailType, setEmailType] = useState<string>("quiz-result");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);

  const [healthLoading, setHealthLoading] = useState(false);
  const [healthResult, setHealthResult] = useState<HealthResult | null>(null);

  const [diagLoading, setDiagLoading] = useState(false);
  const [diagResult, setDiagResult] = useState<DiagResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<SimulateResult | null>(null);

  const handleSendTest = async () => {
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, emailType }),
      });
      const data = await res.json();
      setSendResult(data);
    } catch (err) {
      setSendResult({ error: "Netværksfejl — prøv igen" });
    }
    setSending(false);
  };

  const handleDiagnostics = async () => {
    setDiagLoading(true);
    setDiagResult(null);
    try {
      const res = await fetch("/api/admin/diagnostics");
      const data = await res.json();
      setDiagResult(data);
    } catch {
      setDiagResult({ error: "Netværksfejl — prøv igen" });
    }
    setDiagLoading(false);
  };

  const handleSimulateInbound = async () => {
    setSimLoading(true);
    setSimResult(null);
    try {
      const res = await fetch("/api/admin/diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate-inbound" }),
      });
      const data = await res.json();
      setSimResult(data);
    } catch {
      setSimResult({ error: "Netværksfejl — prøv igen" });
    }
    setSimLoading(false);
  };

  const handleHealthCheck = async () => {
    setHealthLoading(true);
    setHealthResult(null);
    try {
      const res = await fetch("/api/admin/email-health");
      const data = await res.json();
      setHealthResult(data);
    } catch {
      setHealthResult({ error: "Netværksfejl — prøv igen" });
    }
    setHealthLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1C2B2A] mb-6">Email Test</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send test-email */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-[#1C2B2A] mb-4">
            Send test-email
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Send test-email til
              </label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#1B7A6E] focus:border-transparent outline-none"
                placeholder="email@eksempel.dk"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email-type
              </label>
              <select
                value={emailType}
                onChange={(e) => setEmailType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#1B7A6E] focus:border-transparent outline-none bg-white"
              >
                {emailTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSendTest}
              disabled={sending || !to}
              className={`w-full px-5 py-3 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all text-sm ${
                sending || !to ? "opacity-40 cursor-not-allowed" : ""
              }`}
            >
              {sending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sender...
                </span>
              ) : (
                "Send test-email"
              )}
            </button>
          </div>

          {/* Result */}
          {sendResult && (
            <div
              className={`mt-4 rounded-xl border p-4 ${
                sendResult.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              {sendResult.success ? (
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-green-800">
                    Email sendt!
                  </p>
                  <p className="text-xs text-green-700">
                    Type: {sendResult.type}
                  </p>
                  <p className="text-xs text-green-700">
                    Til: {sendResult.to}
                  </p>
                  <p className="text-xs text-green-700">
                    Emne: {sendResult.subject}
                  </p>
                  {sendResult.messageId && (
                    <p className="text-xs text-green-600 font-mono">
                      Message ID: {sendResult.messageId}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-red-700">{sendResult.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Deliverability check */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-[#1C2B2A] mb-4">
            Deliverability check
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            Tjek DNS-konfiguration og domæne-verifikation hos Resend.
          </p>

          <button
            onClick={handleHealthCheck}
            disabled={healthLoading}
            className={`w-full px-5 py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all text-sm ${
              healthLoading ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            {healthLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Tjekker...
              </span>
            ) : (
              "Kør deliverability check"
            )}
          </button>

          {/* Health result */}
          {healthResult && (
            <div className="mt-4 space-y-4">
              {healthResult.error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-700">{healthResult.error}</p>
                </div>
              ) : (
                <>
                  {/* Domain status */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-[#1C2B2A]">
                        Domæne: {healthResult.domain}
                      </h3>
                      <StatusBadge status={healthResult.status || "unknown"} />
                    </div>
                    {healthResult.region && (
                      <p className="text-xs text-gray-500">
                        Region: {healthResult.region}
                      </p>
                    )}
                  </div>

                  {/* Sender info */}
                  {healthResult.senderInfo && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-bold text-[#1C2B2A] mb-2">
                        Afsender-info
                      </h3>
                      <div className="space-y-1 text-xs text-gray-700">
                        <p>
                          <span className="font-medium text-gray-500 w-16 inline-block">
                            From:
                          </span>{" "}
                          {healthResult.senderInfo.from}
                        </p>
                        <p>
                          <span className="font-medium text-gray-500 w-16 inline-block">
                            Reply-To:
                          </span>{" "}
                          {healthResult.senderInfo.replyTo}
                        </p>
                        <p>
                          <span className="font-medium text-gray-500 w-16 inline-block">
                            Noreply:
                          </span>{" "}
                          {healthResult.senderInfo.noreply}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* DNS records */}
                  {healthResult.dns && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-bold text-[#1C2B2A] mb-3">
                        DNS Status
                      </h3>
                      <div className="space-y-3">
                        {/* SPF */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              SPF
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[250px]">
                              {healthResult.dns.spf.name}
                            </p>
                          </div>
                          <StatusBadge
                            status={healthResult.dns.spf.status}
                          />
                        </div>

                        {/* DKIM */}
                        {healthResult.dns.dkim.map((d, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                DKIM {healthResult.dns!.dkim.length > 1 ? i + 1 : ""}
                              </p>
                              <p className="text-xs text-gray-500 truncate max-w-[250px]">
                                {d.name}
                              </p>
                            </div>
                            <StatusBadge status={d.status} />
                          </div>
                        ))}

                        {/* DMARC */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              DMARC
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[250px]">
                              {healthResult.dns.dmarc.name}
                            </p>
                          </div>
                          <StatusBadge
                            status={healthResult.dns.dmarc.status}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All records detail */}
                  {healthResult.allRecords &&
                    healthResult.allRecords.length > 0 && (
                      <details className="bg-gray-50 rounded-xl p-4">
                        <summary className="text-sm font-bold text-[#1C2B2A] cursor-pointer">
                          Alle DNS-records ({healthResult.allRecords.length})
                        </summary>
                        <div className="mt-3 overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left text-gray-500">
                                <th className="pb-2 pr-3">Type</th>
                                <th className="pb-2 pr-3">Navn</th>
                                <th className="pb-2 pr-3">Status</th>
                                <th className="pb-2">V&aelig;rdi</th>
                              </tr>
                            </thead>
                            <tbody className="text-gray-700">
                              {healthResult.allRecords.map((r, i) => (
                                <tr
                                  key={i}
                                  className="border-t border-gray-200"
                                >
                                  <td className="py-1.5 pr-3 font-medium">
                                    {r.record || r.type}
                                  </td>
                                  <td className="py-1.5 pr-3 font-mono truncate max-w-[120px]">
                                    {r.name}
                                  </td>
                                  <td className="py-1.5 pr-3">
                                    <StatusBadge status={r.status} />
                                  </td>
                                  <td className="py-1.5 font-mono truncate max-w-[200px]">
                                    {r.value}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </details>
                    )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Diagnostics */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DB Diagnostics */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-[#1C2B2A] mb-2">
            Database diagnostik
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            K&oslash;r count-queries p&aring; alle tabeller for at tjekke RLS og data.
          </p>

          <button
            onClick={handleDiagnostics}
            disabled={diagLoading}
            className={`w-full px-5 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-all text-sm ${
              diagLoading ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            {diagLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                K&oslash;rer...
              </span>
            ) : (
              "K&oslash;r diagnostik"
            )}
          </button>

          {diagResult && (
            <div className="mt-4 space-y-3">
              {diagResult.error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-700">{diagResult.error}</p>
                </div>
              ) : (
                <>
                  {/* Table counts */}
                  {diagResult.tableCounts && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-bold text-[#1C2B2A] mb-2">
                        Tabel-counts (service role key)
                      </h3>
                      <div className="space-y-1.5">
                        {Object.entries(diagResult.tableCounts).map(
                          ([table, info]) => (
                            <div
                              key={table}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm font-mono text-gray-700">
                                {table}
                              </span>
                              {info.error ? (
                                <span className="text-xs text-red-600 font-medium">
                                  FEJL: {info.error}
                                </span>
                              ) : (
                                <span
                                  className={`text-sm font-bold ${
                                    info.count === 0
                                      ? "text-gray-400"
                                      : "text-[#1B7A6E]"
                                  }`}
                                >
                                  {info.count}
                                </span>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recent inbound */}
                  {diagResult.recentInbound &&
                    diagResult.recentInbound.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-sm font-bold text-[#1C2B2A] mb-2">
                          Seneste inbound emails
                        </h3>
                        <div className="space-y-1.5 text-xs">
                          {diagResult.recentInbound.map((e) => (
                            <div
                              key={e.id}
                              className="flex items-center justify-between"
                            >
                              <span className="text-gray-700 truncate max-w-[200px]">
                                {e.from_email}: {e.subject}
                              </span>
                              <span className="text-gray-500">
                                {e.direction || "null"}{" "}
                                {e.received_at
                                  ? new Date(e.received_at).toLocaleDateString(
                                      "da-DK"
                                    )
                                  : "no date"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Env check */}
                  {diagResult.env && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-bold text-[#1C2B2A] mb-2">
                        Env-variabler
                      </h3>
                      <div className="space-y-1 text-xs text-gray-700">
                        {Object.entries(diagResult.env).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="font-mono">{k}</span>
                            <span
                              className={
                                v ? "text-green-600" : "text-red-600"
                              }
                            >
                              {String(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Simulate inbound */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-[#1C2B2A] mb-2">
            Test inbound webhook
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Inds&aelig;t en simuleret inbound email direkte i databasen for at
            teste om admin-indbakken viser den.
          </p>

          <button
            onClick={handleSimulateInbound}
            disabled={simLoading}
            className={`w-full px-5 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-400 transition-all text-sm ${
              simLoading ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            {simLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Simulerer...
              </span>
            ) : (
              "Simuler inbound email"
            )}
          </button>

          {simResult && (
            <div
              className={`mt-4 rounded-xl border p-4 ${
                simResult.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              {simResult.success ? (
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    Test-email indsat!
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    ID: {simResult.id}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    G&aring; til{" "}
                    <a
                      href="/admin/inbox"
                      className="underline font-medium"
                    >
                      Indbakke
                    </a>{" "}
                    for at se den.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-red-700 font-semibold">
                    Fejl ved inds&aelig;tning
                  </p>
                  <p className="text-xs text-red-600 mt-1 font-mono">
                    {simResult.error}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
