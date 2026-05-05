import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { retrieveProdigiContext } from "@/lib/prodigi-rag";
import {
    classifyProdigiIntent,
    getIntentGuidance,
} from "@/lib/prodigi-router";
import { logProdigiQuestion } from "@/lib/prodigi-logger";

export const runtime = "nodejs";
export const maxDuration = 30;

function extractTextFromMessage(message: any): string {
    if (!message) return "";

    if (typeof message.content === "string") {
        return message.content;
    }

    if (typeof message.text === "string") {
        return message.text;
    }

    if (Array.isArray(message.parts)) {
        return message.parts
            .filter((part: any) => part.type === "text")
            .map((part: any) => part.text)
            .join("\n");
    }

    return "";
}

function getLatestUserText(body: any): string {
    // AI SDK 5 usually sends the latest message as body.message
    if (body.message) {
        return extractTextFromMessage(body.message);
    }

    // Some versions or clients may send all messages as body.messages
    if (Array.isArray(body.messages)) {
        const latestUserMessage = [...body.messages]
            .reverse()
            .find((message: any) => message.role === "user");

        return extractTextFromMessage(latestUserMessage);
    }

    return "";
}

function getSourceTitles(retrievedDocs: any[]): string[] {
    return Array.from(
        new Set(
            retrievedDocs
                .map((doc: any) => doc.source_title)
                .filter(Boolean)
        )
    );
}

function buildSourceList(retrievedDocs: any[]): string {
    const sourceTitles = getSourceTitles(retrievedDocs);

    if (sourceTitles.length === 0) {
        return "No source titles were retrieved.";
    }

    return sourceTitles.join(", ");
}

export async function POST(req: Request) {
    try {
        console.log("PRODIGI AI chat route called");

        const body = await req.json();

        const latestUserMessage = getLatestUserText(body);

        console.log("Latest user message:", latestUserMessage);

        if (!latestUserMessage) {
            return new Response("No user message found.", { status: 400 });
        }

        const intent = classifyProdigiIntent(latestUserMessage);
        const intentGuidance = getIntentGuidance(intent);

        console.log("Detected intent:", intent);

        const retrievedDocs = await retrieveProdigiContext(latestUserMessage);

        console.log("Retrieved docs:", retrievedDocs.length);

        const sourceTitles = getSourceTitles(retrievedDocs);
        const sourceList = buildSourceList(retrievedDocs);

        // Log the question for analytics. If logging fails, the chat should still work.
        await logProdigiQuestion({
            question: latestUserMessage,
            intent,
            retrievedSources: sourceTitles,
            retrievedCount: retrievedDocs.length,
        });

        const contextText = retrievedDocs
            .map(
                (doc: any, index: number) =>
                    `[Source ${index + 1}: ${doc.source_title || "Untitled Source"
                    }]\n${doc.content}`
            )
            .join("\n\n");

        const systemPrompt = `
You are Ask PRODIGI AI, a retrieval-grounded research intelligence assistant for Dr. Kazi Monzure Khoda's PRODIGI Research Group.

Detected user intent: ${intent}

Intent-specific guidance:
${intentGuidance}

Use only the provided PRODIGI knowledge base context to answer.

Core rules:
- Be professional, concise, and technically credible.
- Give a direct answer first.
- Use 2 to 4 supporting details when useful.
- Do not invent publications, funding, collaborators, students, positions, awards, affiliations, grants, or claims.
- Do not present yourself as Dr. Khoda.
- Do not make admissions, funding, hiring, collaboration, consulting, proposal, or authorship commitments.
- If the context is insufficient, say: "The current PRODIGI knowledge base does not contain enough verified information to answer that precisely."
- If the user asks about current or changing details such as open positions, funding, citation counts, or official contact details, state that these may change and recommend checking the official website or contacting Dr. Khoda directly.
- For publication questions, include title, year, venue, and relevance when available.
- For student questions, discuss fit and preparation, not admission or funding promises.
- For collaboration questions, identify relevant technical alignment and suggest a concise next step.

Answer format:
- Start with the answer.
- Use short paragraphs or tight bullets.
- End with this exact line when retrieved sources are available:
Knowledge base used: ${sourceList}

PRODIGI knowledge base context:
${contextText || "No relevant context was retrieved."}
`;

        const result = streamText({
            model: openai("gpt-4.1-mini"),
            system: systemPrompt,
            prompt: latestUserMessage,
        });

        return result.toUIMessageStreamResponse();
    } catch (error: any) {
        console.error("PRODIGI AI route error:", error);

        return new Response(
            error?.message || "An error occurred in Ask PRODIGI AI.",
            { status: 500 }
        );
    }
}