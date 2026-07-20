function getRsvpApiUrl() {
  const url = process.env.RSVP_API_URL || process.env.VITE_RSVP_API_URL;

  if (!url) throw new Error("Missing RSVP_API_URL.");

  return url;
}

function parseApiResponse(text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid response from RSVP service.");
  }
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).end();
    return;
  }

  try {
    const upstream = await fetch(getRsvpApiUrl(), {
      body: JSON.stringify(request.body || {}),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      method: "POST",
    });
    const result = parseApiResponse(await upstream.text());

    if (!upstream.ok || result?.success === false) {
      response.status(upstream.ok ? 502 : upstream.status).json(result);
      return;
    }

    response.status(200).json(result);
  } catch (error) {
    console.error("RSVP proxy failed", error);
    response.status(502).json({ error: "RSVP service unavailable." });
  }
}
