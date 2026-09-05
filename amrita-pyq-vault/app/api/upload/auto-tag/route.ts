import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Shape returned to the Upload Assistant form for auto-fill.
interface AutoTagResult {
  subject_code: string | null;
  subject_name: string | null;
  year: number | null;
  exam_type: "MID_SEM" | "END_SEM" | "SUPPLEMENTARY" | "MODEL" | null;
  confidence: number; // 0-1, surfaced in the UI so students can double-check low-confidence guesses
}

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

const EXTRACTION_PROMPT = `
You are reading the cover/first page of an Indian university exam question paper.
Extract the following fields as strict JSON, with no markdown fences and no commentary:

{
  "subject_code": string | null,   // e.g. "23ECE211"
  "subject_name": string | null,   // e.g. "Microcontrollers & Interfacing"
  "year": number | null,           // 4-digit exam year
  "exam_type": "MID_SEM" | "END_SEM" | "SUPPLEMENTARY" | "MODEL" | null,
  "confidence": number             // 0 to 1, your confidence in this extraction
}

If a field cannot be determined, set it to null. Return ONLY the JSON object.
`.trim();

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Expected a multipart form field named 'file' (page 1 image or single-page PDF)." },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: EXTRACTION_PROMPT },
            {
              inline_data: {
                mime_type: file.type || "application/pdf",
                data: base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    return NextResponse.json(
      { error: "Gemini extraction failed.", detail: errText },
      { status: 502 }
    );
  }

  const geminiJson = await geminiRes.json();
  const rawText: string | undefined =
    geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    return NextResponse.json(
      { error: "Gemini returned no extractable content." },
      { status: 502 }
    );
  }

  let parsed: AutoTagResult;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return NextResponse.json(
      { error: "Gemini response was not valid JSON.", raw: rawText },
      { status: 502 }
    );
  }

  return NextResponse.json(parsed satisfies AutoTagResult);
}
