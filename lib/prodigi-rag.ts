import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiApiKey = process.env.OPENAI_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

export async function retrieveProdigiContext(question: string) {
    const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: question,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    const { data, error } = await supabase.rpc("match_prodigi_documents", {
        query_embedding: queryEmbedding,
        match_count: 6,
        similarity_threshold: 0.25,
    });

    if (error) {
        console.error("RAG retrieval error:", error);
        return [];
    }

    return data || [];
}