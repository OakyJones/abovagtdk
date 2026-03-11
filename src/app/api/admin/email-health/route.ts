import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface ResendDomain {
  id: string;
  name: string;
  status: string;
  region: string;
  created_at: string;
  records: {
    record: string;
    name: string;
    type: string;
    ttl: string;
    status: string;
    value: string;
    priority?: number;
  }[];
}

export async function GET() {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY ikke konfigureret" },
        { status: 500 }
      );
    }

    // Fetch domains from Resend API
    const domainsRes = await fetch("https://api.resend.com/domains", {
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
    });

    if (!domainsRes.ok) {
      const errText = await domainsRes.text();
      return NextResponse.json(
        { error: `Resend API fejl: ${domainsRes.status} ${errText}` },
        { status: 500 }
      );
    }

    const domainsData = await domainsRes.json();
    const domains: ResendDomain[] = domainsData.data || [];

    // Find abovagt.dk domain
    const abovagtDomain = domains.find((d) => d.name === "abovagt.dk");

    if (!abovagtDomain) {
      return NextResponse.json({
        domain: "abovagt.dk",
        status: "not_found",
        message: "Domænet abovagt.dk blev ikke fundet i Resend",
        allDomains: domains.map((d) => ({
          name: d.name,
          status: d.status,
        })),
        senderInfo: {
          from: "AboVagt <tjek@abovagt.dk>",
          replyTo: "hej@abovagt.dk",
          noreply: "noreply@abovagt.dk",
        },
      });
    }

    // Parse DNS records for SPF, DKIM, DMARC
    const records = abovagtDomain.records || [];

    const spfRecord = records.find(
      (r) => r.record === "SPF" || r.type === "TXT" && r.value?.includes("spf")
    );
    const dkimRecords = records.filter(
      (r) => r.record === "DKIM" || (r.type === "CNAME" && r.name?.includes("resend"))
    );
    const dmarcRecord = records.find(
      (r) => r.record === "DMARC" || (r.type === "TXT" && r.name?.includes("_dmarc"))
    );

    return NextResponse.json({
      domain: abovagtDomain.name,
      status: abovagtDomain.status,
      region: abovagtDomain.region,
      createdAt: abovagtDomain.created_at,
      senderInfo: {
        from: "AboVagt <tjek@abovagt.dk>",
        replyTo: "hej@abovagt.dk",
        noreply: "noreply@abovagt.dk",
      },
      dns: {
        spf: {
          status: spfRecord?.status || "not_found",
          name: spfRecord?.name || "-",
          value: spfRecord?.value || "-",
        },
        dkim: dkimRecords.map((r) => ({
          status: r.status,
          name: r.name,
          value: r.value?.substring(0, 60) + "...",
        })),
        dmarc: {
          status: dmarcRecord?.status || "not_found",
          name: dmarcRecord?.name || "-",
          value: dmarcRecord?.value || "-",
        },
      },
      allRecords: records.map((r) => ({
        record: r.record,
        type: r.type,
        name: r.name,
        status: r.status,
        value: r.value?.substring(0, 80),
      })),
    });
  } catch (error) {
    console.error("Email health check error:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente email-sundhedsstatus" },
      { status: 500 }
    );
  }
}
