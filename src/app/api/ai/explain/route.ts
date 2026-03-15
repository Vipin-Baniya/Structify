import { NextRequest } from "next/server";
import { requireAdmin, err } from "@/lib/apiHelpers";

// POST /api/ai/explain
// Body: { code: string, language: string, filePath: string, projectTitle: string }
// Calls OpenAI API with streaming and proxies the SSE back to the client
export async function POST(req: NextRequest) {
  // Require admin session — prevents public abuse of the API key
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { code, language, filePath, projectTitle } = await req.json();

    if (!code) return err("code is required");
    if (code.length > 50000) return err("File too large to explain (max 50k chars)");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return err("OpenAI API key not configured. Add OPENAI_API_KEY to your .env.local", 503);

    const prompt = `You are a senior software engineer reviewing code from the project "${projectTitle || "unknown"}".

File: ${filePath || "unknown"}
Language: ${language || "unknown"}

Here is the code:

\`\`\`${language || ""}
${code.slice(0, 40000)}
\`\`\`

Explain this file clearly and concisely for a technical recruiter or engineer who wants to understand:
1. What this file does and its purpose in the project
2. Key functions, classes, or logic (2-4 most important)
3. Any interesting technical decisions, patterns, or optimizations
4. How it fits into the broader system

Keep the explanation under 200 words. Use plain language. No markdown headers.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       "gpt-4o-mini",  // cost-effective, good at code explanation
        max_tokens:  512,
        stream:      true,
        messages:    [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return err(`OpenAI API error: ${response.status} — ${errText}`, 502);
    }

    // Proxy the SSE stream directly back to the client
    return new Response(response.body, {
      headers: {
        "Content-Type":  "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection":    "keep-alive",
      },
    });
  } catch (e: any) {
    return err(e.message || "AI explain failed", 500);
  }
}
