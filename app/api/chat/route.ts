import { demoGenerate } from "@/lib/ai/generate";

export const maxDuration = 30;

export const POST = async (request: Request) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const prompt =
    typeof body === "object" &&
    body !== null &&
    "prompt" in body &&
    typeof (body as { prompt: unknown }).prompt === "string"
      ? (body as { prompt: string }).prompt
      : null;

  if (prompt === null) {
    return Response.json(
      { ok: false, error: 'Expected JSON body: { "prompt": "..." }' },
      { status: 400 },
    );
  }

  const result = await demoGenerate(prompt);
  if (!result.ok) {
    const status = result.error.includes("not configured") ? 503 : 400;
    return Response.json(result, { status });
  }

  return Response.json(result);
};
