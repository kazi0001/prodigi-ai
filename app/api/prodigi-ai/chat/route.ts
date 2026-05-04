import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { retrieveProdigiContext } from "@/lib/prodigi-rag";

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
    // AI SDK 5 often sends the latest message as body.message
    if (body.message) {
        return extractTextFromMessage(body.message);
    }

    // Some versions send all messages as body.messages
    if (Array.isArray(body.messages)) {
        const latestUserMessage = [...body.messages]
            .reverse()
            .find((message: any) => message.role === "user");

        return extractTextFromMessage(latestUserMessage);
    }

    return "";
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

        const retrievedDocs = await retrieveProdigiContext(latestUserMessage);

        console.log("Retrieved docs:", retrievedDocs.length);

        const contextText = retrievedDocs
            .map(
                (doc: any, index: number) =>
                    `[Source ${index + 1}: ${doc.source_title}]\n${doc.content}`
            )
            .join("\n\n");

        const systemPrompt = `
You are Ask PRODIGI AI, a retrieval-grounded research assistant for Dr. Kazi Monzure Khoda's PRODIGI Research Group.

Use only the provided PRODIGI knowledge base context to answer questions.

Rules:
- Be concise, professional, and accurate.
- Do not invent publications, funding, collaborators, students, positions, or claims.
- If the context is insufficient, say: "The current PRODIGI knowledge base does not contain enough verified information to answer that precisely."
- For prospective students, provide general guidance only. Do not promise admission, funding, or positions.
- For collaboration questions, summarize relevant expertise and suggest contacting Dr. Khoda directly.
- Do not present yourself as Dr. Khoda.
- Make clear that you are an AI assistant.

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