export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Cache-Control": "no-cache",
    };

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    // ── Mod Sink: ?sink_target=<url> ──
    const sinkTarget = url.searchParams.get("sink_target");
    if (sinkTarget) {
      if (!sinkTarget.startsWith("https://")) {
        return new Response("URL tidak dibenarkan", { status: 403, headers: corsHeaders });
      }
      const fwdHeaders = new Headers();
      const auth = request.headers.get("Authorization");
      const ct = request.headers.get("Content-Type");
      if (auth) fwdHeaders.set("Authorization", auth);
      if (ct) fwdHeaders.set("Content-Type", ct);

      const sinkResp = await fetch(sinkTarget, {
        method: request.method,
        headers: fwdHeaders,
        body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
      });
      const body = await sinkResp.arrayBuffer();
      return new Response(body, {
        status: sinkResp.status,
        headers: {
          "Content-Type": sinkResp.headers.get("Content-Type") || "application/json",
          ...corsHeaders,
        },
      });
    }

    // ── Mod Google Sheets: ?url=<url> ──
    const target = url.searchParams.get("url");
    if (!target) {
      return new Response("Missing ?url= parameter", { status: 400, headers: corsHeaders });
    }
    if (!target.startsWith("https://docs.google.com/spreadsheets/")) {
      return new Response("URL tidak dibenarkan", { status: 403, headers: corsHeaders });
    }

    const response = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const body = await response.arrayBuffer();
    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/pdf",
        ...corsHeaders,
      },
    });
  },
};
