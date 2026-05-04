import os
from pathlib import Path
from openai import OpenAI
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(".env.local")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not OPENAI_API_KEY:
    raise ValueError("Missing OPENAI_API_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase environment variables")

openai_client = OpenAI(api_key=OPENAI_API_KEY)
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def chunk_text(text, chunk_size=1000, overlap=180):
    text = text.replace("\r\n", "\n").strip()
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start += chunk_size - overlap

    return chunks


def embed_text(text):
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding


def ingest_file(file_path: Path):
    text = file_path.read_text(encoding="utf-8")
    chunks = chunk_text(text)

    source_title = file_path.stem.replace("_", " ").title()
    source_type = "research_group_knowledge"
    source_url = "https://kprodigihub.com/"

    print(f"Ingesting {file_path.name}: {len(chunks)} chunks")

    for chunk in chunks:
        embedding = embed_text(chunk)

        supabase.table("prodigi_documents").insert({
            "source_title": source_title,
            "source_type": source_type,
            "source_url": source_url,
            "content": chunk,
            "embedding": embedding
        }).execute()


def main():
    data_dir = Path("data")

    if not data_dir.exists():
        raise FileNotFoundError("data folder not found")

    for file_path in data_dir.glob("*.txt"):
        ingest_file(file_path)

    print("Done ingesting PRODIGI knowledge base.")


if __name__ == "__main__":
    main()