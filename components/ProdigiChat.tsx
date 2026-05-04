"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

const suggestedQuestions = [
    {
        label: "Research overview",
        question: "What does the PRODIGI Research Group work on?",
    },
    {
        label: "Prospective students",
        question:
            "I am interested in AI and chemical engineering. Would I be a good fit for Dr. Khoda's group?",
    },
    {
        label: "Publications",
        question:
            "What are Dr. Khoda's representative publications related to hydrogen, CCUS, and process systems engineering?",
    },
    {
        label: "Collaboration fit",
        question:
            "What types of academic or industry collaborations fit the PRODIGI Research Group?",
    },
    {
        label: "Agentic AI",
        question:
            "How does Dr. Khoda's group use agentic AI, retrieval-grounded AI, and physics-informed modeling?",
    },
];

export default function ProdigiChat() {
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement | null>(null);

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
                        text:
                            "Welcome to Ask PRODIGI AI. I can help visitors explore Dr. Khoda’s research group, publications, student opportunities, and collaboration areas using approved retrieval-grounded information.",
                    },
                ],
            },
        ],
    });

    const isLoading = status === "submitted" || status === "streaming";
    const visibleMessages = messages as any[];

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [visibleMessages.length, status]);

    async function submitQuestion(text: string) {
        const cleanText = text.trim();
        if (!cleanText || isLoading) return;

        setInput("");

        await sendMessage({
            text: cleanText,
        });
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await submitQuestion(input);
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
        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/90 shadow-2xl shadow-cyan-950/20">
            <div className="border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                                Retrieval-grounded
                            </span>
                            <span className="rounded-full border border-indigo-400/40 bg-indigo-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-300">
                                Physics-informed
                            </span>
                            <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                                Research assistant
                            </span>
                        </div>

                        <h2 className="text-xl font-semibold text-white">
                            PRODIGI Research Intelligence Assistant
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                            Ask focused questions about research themes, publications,
                            collaboration fit, student opportunities, and AI-enabled chemical
                            engineering. Responses are generated from a curated knowledge base,
                            not from open-ended web search.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300 lg:w-72">
                        <p className="font-medium text-white">How this works</p>
                        <p className="mt-2 leading-6">
                            Your question is matched with approved PRODIGI knowledge, then an
                            AI model drafts a concise answer with guardrails against unsupported
                            claims.
                        </p>
                    </div>
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                    {suggestedQuestions.map((item) => (
                        <button
                            key={item.label}
                            type="button"
                            onClick={() => submitQuestion(item.question)}
                            disabled={isLoading}
                            className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-left transition hover:border-cyan-400/60 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <p className="text-sm font-semibold text-cyan-300">
                                {item.label}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                                {item.question}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[540px] overflow-y-auto bg-slate-950 p-6">
                <div className="space-y-5">
                    {visibleMessages.map((message) => {
                        const isUser = message.role === "user";
                        const text = getMessageText(message);

                        return (
                            <div
                                key={message.id}
                                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={
                                        isUser
                                            ? "max-w-[82%] rounded-3xl bg-cyan-600 px-5 py-4 text-white shadow-lg shadow-cyan-950/30"
                                            : "max-w-[82%] rounded-3xl border border-slate-800 bg-slate-900 px-5 py-4 text-slate-100 shadow-lg shadow-slate-950/30"
                                    }
                                >
                                    {!isUser && (
                                        <div className="mb-2 flex items-center gap-2">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-bold text-cyan-300">
                                                AI
                                            </div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                                                Ask PRODIGI AI
                                            </p>
                                        </div>
                                    )}

                                    <p className="whitespace-pre-wrap text-sm leading-7">
                                        {text}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[82%] rounded-3xl border border-slate-800 bg-slate-900 px-5 py-4 text-slate-100">
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-bold text-cyan-300">
                                        AI
                                    </div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                                        Retrieval in progress
                                    </p>
                                </div>
                                <p className="text-sm leading-7 text-slate-300">
                                    Searching the curated PRODIGI knowledge base and preparing a
                                    grounded response...
                                </p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex justify-start">
                            <div className="max-w-[82%] rounded-3xl border border-red-800 bg-red-950/80 px-5 py-4 text-sm text-red-100">
                                <p className="font-semibold">System message</p>
                                <p className="mt-1">
                                    {error.message || "Something went wrong. Please try again."}
                                </p>
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>
            </div>

            <form
                onSubmit={onSubmit}
                className="border-t border-slate-800 bg-slate-900/80 p-5"
            >
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="Ask about research, publications, students, collaborations, or agentic AI..."
                        className="min-h-12 flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-5 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    />

                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="rounded-2xl bg-cyan-500 px-7 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Ask
                    </button>
                </div>

                <div className="mt-4 flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        Built as a retrieval-grounded AI assistant for research navigation,
                        not as a generic chatbot.
                    </p>
                    <p>
                        No admissions, funding, or collaboration decisions are made by this
                        assistant.
                    </p>
                </div>
            </form>
        </section>
    );
}