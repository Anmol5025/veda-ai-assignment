import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questionPaperData, answerSheetData } = body;

    if (!questionPaperData || !answerSheetData) {
      return NextResponse.json({ error: 'Missing OCR data' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured in .env' }, { status: 500 });
    }
    
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Prepare a concise summary of the data to avoid token overflow
    const qpSummary = questionPaperData.map((p: any) => `[Page ${p.pageNumber}]\n${p.text}`).join('\n\n');
    const ansSummary = answerSheetData.map((p: any) => `[Page ${p.pageNumber}]\n${p.text}`).join('\n\n');

    const prompt = `
You are an expert assessment grader and AI extraction tool.
Your task is to analyze the extracted text from a Question Paper and a Student's Answer Sheet, and map the answers to the questions.
CRITICAL: You MUST extract EVERY SINGLE question present in the Question Paper text, even if the student did not answer it. Do not truncate or summarize the list of questions.

IMPORTANT: The response MUST be a valid JSON object following this EXACT structure without any markdown formatting or extra text:
{
  "questions": [
    { "id": "q1", "number": "1", "text": "What is ...?", "pageNumber": 1 }
  ],
  "answers": [
    { 
      "id": "a1", 
      "detectedQuestionNumber": "1", 
      "text": "The answer is ...", 
      "confidence": 0.9, 
      "regions": [
        { "pageNumber": 1, "boundingBox": { "x": 0.1, "y": 0.1, "width": 0.8, "height": 0.1 } }
      ] 
    }
  ],
  "mappings": [
    { "questionId": "q1", "answerId": "a1", "status": "answered", "confidence": 0.95, "score": 5 }
  ]
}

NOTES ON MAPPING & REGIONS:
- Map answers based on explicitly written question numbers or semantic matching.
- For bounding boxes in "regions", try to provide a reasonable estimate (e.g., x: 0.1, width: 0.8) if you cannot determine it exactly from the text context, or map it approximately based on the line position if you were provided line data.
- "status" in mappings must be exactly one of: "answered", "unanswered", "unmatched", "unclear".

--- QUESTION PAPER TEXT ---
${qpSummary}

--- ANSWER SHEET TEXT ---
${ansSummary}
`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: prompt }
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    });

    const resultText = completion.choices[0].message.content;
    if (!resultText) throw new Error("No response from Groq");

    const resultJson = JSON.parse(resultText);

    return NextResponse.json(resultJson);

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || 'Processing failed' }, { status: 500 });
  }
}
