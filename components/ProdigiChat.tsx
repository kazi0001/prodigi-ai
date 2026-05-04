"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

export default function ProdigiChat() {
    const [input, setInput] = useState("");

    const { messages, sendMessage, status, error } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/prodigi-ai/chat",
        }),
        messages: [
            {
                id: "welcome",
                role: "assistant",
                parts: [
                    {
                        type: "text",
                        text: "Hello, I’m Ask PRODIGI AI. I can answer questions about Dr. Khoda’s research group, research areas, publications, student opportunities, and collaboration topics using approved group information.",
                    },
                ],
            },
        ],
    });

    const isLoading = status === "submitted" || status === "streaming";

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const text = input.trim();
        if (!text || isLoading) return;

        setInput("");

        await sendMessage({
            text,
        });
    }

    function getMessageText(message: any) {
        if (message.parts && Array.isArray(message.parts)) {
            return message.parts
                .filter((part: any) => part.type === "text")
                .map((part: any) => part.text)
                .join("");
        }

        return message.content ?? "";
    }

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
            <div className="h-[520px] overflow-y-auto p-5 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={
                            message.role === "user"
                                ? "ml-auto max-w-[80%] rounded-2xl bg-cyan-600 px-4 py-3 text-white"
                                : "mr-auto max-w-[80%] rounded-2xl bg-slate-800 px-4 py-3 text-slate-100"
                        }
                    >
                        <p className="whitespace-pre-wrap text-sm leading-6">
                            {getMessageText(message)}
                        </p>
                    </div>
                ))}

                {isLoading && (
                    <div className="mr-auto max-w-[80%] rounded-2xl bg-slate-800 px-4 py-3 text-sm text-slate-300">
                        Searching the PRODIGI knowledge base...
                    </div>
                )}

                {error && (
                    <div className="mr-auto max-w-[80%] rounded-2xl bg-red-900 px-4 py-3 text-sm text-red-100">
                        Error: {error.message}
                    </div>
                )}
            </div>

            <form onSubmit={onSubmit} className="border-t border-slate-800 p-4">
                <div className="flex gap-3">
                    <input
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="Ask about research, publications, students, or collaborations..."
                        className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                    />

                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
                    >
                        Ask
                    </button>
                </div>
            </form>
        </div>
    );
}