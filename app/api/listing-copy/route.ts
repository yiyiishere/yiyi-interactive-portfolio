const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

function buildPrompt(payload: {
  productName?: string;
  materials?: string;
  size?: string;
  techniques?: string;
  notes?: string;
  useCases?: string;
}) {
  return `You are a copywriter for Etsy listings. Write in British English using clear, simple sentences. Follow the exact structure:
1) Short opening (1–2 sentences, benefit-led)
2) Product description (what it is, how it’s made)
3) Materials & size (bullet points)
4) Use cases / gifting ideas

Rules:
- Do not exaggerate.
- Do not make sustainability claims unless provided.
- If information is missing, do not invent it. Use neutral wording or omit.
- Provide 13 Etsy tags as a single comma-separated string (no hashtags).

Product details:
- Product name: ${payload.productName || ""}
- Materials: ${payload.materials || ""}
- Size: ${payload.size || ""}
- Techniques: ${payload.techniques || ""}
- Notes: ${payload.notes || ""}
- Use cases: ${payload.useCases || ""}

Return a JSON object with keys: title_short, title_long, description, tags.`;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response("Missing OPENAI_API_KEY", { status: 500 });
  }

  const payload = (await request.json()) as {
    productName?: string;
    materials?: string;
    size?: string;
    techniques?: string;
    notes?: string;
    useCases?: string;
  };

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      messages: [
        {
          role: "system",
          content:
            "You output JSON only with no markdown. Ensure the JSON is valid."
        },
        { role: "user", content: buildPrompt(payload) }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    return new Response(`Copy generation failed: ${errorText}`, { status: 502 });
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    return new Response("No content returned from model", { status: 502 });
  }

  let parsed: {
    title_short: string;
    title_long: string;
    description: string;
    tags: string;
  };

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    return new Response("Failed to parse model response as JSON", {
      status: 502
    });
  }

  return Response.json(parsed);
}
