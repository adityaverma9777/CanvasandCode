import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages, currentCode } = await req.json();

    const systemPrompt = `You are an expert AI coding assistant embedded inside Canvas2Code, a real-time collaborative whiteboard and code editor. You help developers with coding questions, debugging, code review, explaining concepts, architecture decisions, and general conversation. 

When a user shares code context, use it to give specific, relevant answers. Be concise but thorough. Format code with markdown code blocks. You can help with any topic — not just coding — but you excel at technical assistance.

${currentCode ? `\nThe user currently has this code open:\n\`\`\`\n${currentCode.slice(0, 2000)}\n\`\`\`` : ''}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    return NextResponse.json({ reply });
  } catch (err: any) {
    return NextResponse.json({ reply: `Error: ${err.message}` }, { status: 500 });
  }
}
