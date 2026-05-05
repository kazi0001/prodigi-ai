export type ProdigiIntent =
    | "about"
    | "research"
    | "publications"
    | "student"
    | "collaboration"
    | "teaching"
    | "contact"
    | "general";

export function classifyProdigiIntent(question: string): ProdigiIntent {
    const q = question.toLowerCase();

    if (
        q.includes("who is") ||
        q.includes("about dr") ||
        q.includes("about kazi") ||
        q.includes("background") ||
        q.includes("bio") ||
        q.includes("profile")
    ) {
        return "about";
    }

    if (
        q.includes("publication") ||
        q.includes("paper") ||
        q.includes("journal") ||
        q.includes("article") ||
        q.includes("scholar") ||
        q.includes("citation") ||
        q.includes("h-index") ||
        q.includes("cited") ||
        q.includes("highly cited")
    ) {
        return "publications";
    }

    if (
        q.includes("student") ||
        q.includes("phd") ||
        q.includes("graduate") ||
        q.includes("master") ||
        q.includes("ms ") ||
        q.includes("undergraduate") ||
        q.includes("join") ||
        q.includes("position") ||
        q.includes("opening") ||
        q.includes("funding") ||
        q.includes("assistantship") ||
        q.includes("prospective")
    ) {
        return "student";
    }

    if (
        q.includes("collaborate") ||
        q.includes("collaboration") ||
        q.includes("industry") ||
        q.includes("partner") ||
        q.includes("proposal") ||
        q.includes("consulting") ||
        q.includes("work together")
    ) {
        return "collaboration";
    }

    if (
        q.includes("teach") ||
        q.includes("teaching") ||
        q.includes("course") ||
        q.includes("class") ||
        q.includes("education") ||
        q.includes("student learning")
    ) {
        return "teaching";
    }

    if (
        q.includes("contact") ||
        q.includes("email") ||
        q.includes("reach") ||
        q.includes("website") ||
        q.includes("linkedin")
    ) {
        return "contact";
    }

    if (
        q.includes("research") ||
        q.includes("work on") ||
        q.includes("expertise") ||
        q.includes("project") ||
        q.includes("ai") ||
        q.includes("machine learning") ||
        q.includes("rag") ||
        q.includes("agentic") ||
        q.includes("blockchain") ||
        q.includes("hydrogen") ||
        q.includes("ccus") ||
        q.includes("carbon capture") ||
        q.includes("process systems") ||
        q.includes("digital twin") ||
        q.includes("optimization") ||
        q.includes("control")
    ) {
        return "research";
    }

    return "general";
}

export function getIntentGuidance(intent: ProdigiIntent): string {
    switch (intent) {
        case "about":
            return `
The user is asking about Dr. Khoda's background. Summarize his expertise, research identity, and group leadership. Avoid personal claims not present in the knowledge base.
`;

        case "research":
            return `
The user is asking about research areas. Explain the work through process systems engineering, hybrid mechanistic/data-driven modeling, AI, optimization, control, sustainability, blockchain/game theory, hydrogen, CCUS, digital twins, and related applications when supported by context.
`;

        case "publications":
            return `
The user is asking about publications. Prioritize title, year, venue, research area, methods, and relevance. Distinguish journal articles, conference papers, presentations, proceedings, preprints, and ongoing work when the context makes this clear. Do not invent DOIs, citation counts, or publication status.
`;

        case "student":
            return `
The user is likely a prospective or current student. Discuss research fit, useful skills, possible project areas, and how to contact Dr. Khoda. Do not promise admission, funding, assistantships, authorship, or positions.
`;

        case "collaboration":
            return `
The user is asking about collaboration. Identify technical alignment, possible collaboration themes, and a practical next step. Do not commit Dr. Khoda, the group, or the university to any collaboration, funding, consulting, proposal, or authorship role.
`;

        case "teaching":
            return `
The user is asking about teaching or education. Explain teaching-related interests and educational tools only when supported by context. Connect to chemical engineering education, computational tools, AI, process control, and modeling when relevant.
`;

        case "contact":
            return `
The user is asking how to contact or reach the group. Provide general contact guidance only if supported by context. If exact contact details are not in the retrieved context, recommend visiting the official website or contacting Dr. Khoda directly through official channels.
`;

        default:
            return `
The user has a general question. Answer using the most relevant retrieved context. Stay concise and do not speculate beyond the knowledge base.
`;
    }
}