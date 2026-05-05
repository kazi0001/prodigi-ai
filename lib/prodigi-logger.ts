import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function logProdigiQuestion({
    question,
    intent,
    retrievedSources,
    retrievedCount,
}: {
    question: string;
    intent: string;
    retrievedSources: string[];
    retrievedCount: number;
}) {
    const { error } = await supabase.from("prodigi_ai_logs").insert({
        question,
        intent,
        retrieved_sources: retrievedSources,
        retrieved_count: retrievedCount,
    });

    if (error) {
        console.error("Failed to log PRODIGI AI question:", error);
    }
}