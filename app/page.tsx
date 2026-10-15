const HomePage = () => (
  <div className="mx-auto max-w-3xl space-y-4 px-5 py-8">
    <p className="text-sm leading-relaxed text-muted">
      Next.js 16 · React 19 · Vercel AI SDK 7 · Gemini via{" "}
      <code className="text-foreground">@ai-sdk/google</code> · Neon + Drizzle ·
      Zod typing.
    </p>
    <p className="text-sm text-muted">
      Try{" "}
      <code className="text-foreground">POST /api/chat</code> with{" "}
      <code className="text-foreground">{`{ "prompt": "hello" }`}</code>, or{" "}
      <code className="text-foreground">GET /api/health</code> for config status.
    </p>
  </div>
);

export default HomePage;
