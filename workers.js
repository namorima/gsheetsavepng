export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.searchParams.get("url");

    if (!target) {
      return new Response("Missing ?url= parameter", { status: 400 });
    }

    // Hanya benarkan Google Sheets
    if (!target.startsWith("https://docs.google.com/spreadsheets/")) {
      return new Response("URL tidak dibenarkan", { status: 403 });
    }

    const response = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const body = await response.arrayBuffer();

    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/pdf",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
      },
    });
  },
};
