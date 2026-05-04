import ProdigiChat from "@/components/ProdigiChat";

export default function ProdigiAIPage() {
    return (
        <main className="min-h-screen bg-slate-950 text-white px-4 py-10">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                    <p className="text-sm uppercase tracking-wide text-cyan-300">
                        PRODIGI Research Group
                    </p>
                    <h1 className="mt-2 text-4xl font-bold">Ask PRODIGI AI</h1>
                    <p className="mt-4 text-slate-300">
                        A physics-informed, retrieval-grounded research assistant for
                        Dr. Khoda&apos;s research group.
                    </p>
                </div>

                <ProdigiChat />

                <p className="mt-6 text-xs text-slate-400">
                    Ask PRODIGI AI uses approved research-group information to answer
                    general questions. It is not Dr. Khoda and does not make official
                    admissions, funding, or collaboration decisions.
                </p>
            </div>
        </main>
    );
}