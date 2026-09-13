import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

import subprocess
import time
import requests
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import csv
import random
from sentence_transformers import SentenceTransformer
import numpy as np
import astronomy_today

def clean_ansi_and_control_sequences(text: str) -> str:
    """
    Robustly removes ANSI escape codes, terminal cursor/erase control sequences,
    and pseudo-terminal artifacts (e.g., ESC[1D, ESC[K, [1D][K], [5D][K]).
    """
    if not text:
        return ""
    # 1. Standard ANSI escape sequences: ESC [ ... [a-zA-Z] or ESC ] ... ESC \
    text = re.sub(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])', '', text)
    # 2. Bracketed terminal control artifacts that lost ESC byte (e.g. [1D][K], [5D][K], [2K], [1A])
    text = re.sub(r'\[\d+[A-Za-z]\]', '', text)
    text = re.sub(r'\[[A-Za-z]\]', '', text)
    # 3. Trailing/loose ANSI leftovers
    text = re.sub(r'\[\?[0-9;]*[a-zA-Z]', '', text)
    return text.strip()

def ensure_ollama_running():
    try:
        requests.get("http://127.0.0.1:11434", timeout=1)
        print("✅ Ollama already running.")
    except Exception:
        print("🧠 Starting Ollama...")
        try:
            subprocess.Popen(["ollama", "serve"])
            time.sleep(3)
        except Exception as e:
            print(f"⚠️ Could not auto-start Ollama: {e}")

ensure_ollama_running()

app = Flask(__name__)
CORS(app)

print("🧠 Loading local embeddings & unifying knowledge base...")
embed_model = SentenceTransformer("all-MiniLM-L6-v2")

kb_texts = []
kb_embeddings = None

def reload_knowledge_base():
    """
    Builds a unified vector knowledge base combining:
    1. Astronomy research papers (astronomy_papers.csv)
    2. All Astronomy Recently database records (SQLite: astronomy_updates)
    """
    global kb_texts, kb_embeddings
    texts = []

    # 1. Load papers CSV
    csv_path = os.path.join(os.path.dirname(__file__), "data", "astronomy_papers.csv")
    if os.path.exists(csv_path):
        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                abstract = row.get("abstract", "").strip()
                title = row.get("title", "").strip()
                if abstract or title:
                    texts.append(f"Research Paper: {title}\nAbstract: {abstract}")

    # 2. Load Astronomy Recently records from SQLite
    try:
        astro_records = astronomy_today.get_all_astronomy_records()
        for rec in astro_records:
            title = rec.get("title", "").strip()
            desc = rec.get("description", "").strip()
            cat = rec.get("category", "astronomy").capitalize()
            source = rec.get("source_name", "Space Science")
            date_info = rec.get("event_date") or rec.get("published_date") or "Recent"
            if title and desc:
                texts.append(
                    f"Astronomy Update [{cat}] - {title}\n"
                    f"Date: {date_info} | Source: {source}\n"
                    f"Details: {desc}"
                )
    except Exception as e:
        print(f"⚠️ Could not load SQLite astronomy records into RAG: {e}")

    kb_texts = texts
    if kb_texts:
        kb_embeddings = embed_model.encode(kb_texts, normalize_embeddings=True)
        print(f"✅ RAG Knowledge Base loaded: {len(kb_texts)} total astronomy documents/updates indexed!")
    else:
        kb_embeddings = None

# Initialize RAG & start ingestion
astronomy_today.init_db()
astronomy_today.seed_verified_astronomy_data()
astronomy_today.start_background_updater()
reload_knowledge_base()

def search_similarity(query, k=3):
    if not kb_texts or kb_embeddings is None:
        return []
    try:
        q_emb = embed_model.encode([query], normalize_embeddings=True)
        scores = np.dot(kb_embeddings, q_emb.T).flatten()
        top_indices = np.argsort(scores)[::-1][:k]
        return [kb_texts[i] for i in top_indices]
    except Exception as e:
        print(f"⚠️ Similarity search error: {e}")
        return []

IMAGE_MAP = {
    "black hole": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Black_hole_-_Messier_87_crop_max_res.jpg/1200px-Black_hole_-_Messier_87_crop_max_res.jpg",
        "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80"
    ],
    "mars": [
        "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1545156521-77bd85671d30?auto=format&fit=crop&w=800&q=80"
    ],
    "jupiter": [
        "https://images.unsplash.com/photo-1614314107768-6018061b5b72?auto=format&fit=crop&w=800&q=80"
    ],
    "galaxy": [
        "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
    ],
    "nebula": [
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
    ],
    "telescope": [
        "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=800&q=80"
    ],
    "voyager": [
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
    ]
}

def get_space_image(prompt):
    p = prompt.lower()
    for key, urls in IMAGE_MAP.items():
        if key in p:
            return random.choice(urls)
    return None

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json or {}
    user_input = data.get("message", "").strip()
    feedback_mode = data.get("feedback_mode", False)
    context_item = data.get("context_item")  # Specific item passed from "Ask CosmiQ"

    if not user_input:
        return jsonify({"response": "Please enter a valid message."})

    wants_image = any(k in user_input.lower() for k in [
        "picture", "image", "photo", "look like", "see", "show", "appearance"
    ])

    # 1. Prepare RAG / Focused context
    context_parts = []

    if context_item and isinstance(context_item, dict):
        item_title = context_item.get("title", "")
        item_desc = context_item.get("description", "")
        item_source = context_item.get("source_name", "")
        item_date = context_item.get("event_date") or context_item.get("published_date", "")
        item_cat = context_item.get("category", "")
        item_url = context_item.get("source_url", "")

        primary_context = (
            f"SELECTED ASTRONOMY ITEM:\n"
            f"Title: {item_title}\n"
            f"Category: {item_cat}\n"
            f"Date / Status: {item_date}\n"
            f"Source: {item_source} ({item_url})\n"
            f"Description: {item_desc}"
        )
        context_parts.append(primary_context)

    # 2. Add top vector similarity matches from unified RAG index
    retrieved_docs = search_similarity(user_input, k=3)
    if retrieved_docs:
        context_parts.append("RELEVANT KNOWLEDGE BASE CONTEXT:\n" + "\n\n".join(retrieved_docs))

    combined_context = "\n\n---\n\n".join(context_parts)

    prompt = f"""You are CosmiQ, an intelligent astronomy and deep space AI assistant.

Astronomy Knowledge Context:
{combined_context if combined_context else "Use your comprehensive scientific astronomy knowledge."}

User Question: {user_input}

Instructions:
- Provide a clear, scientific, and informative astronomy answer (5-7 concise paragraphs or bullet points).
- If the user is asking about a specific selected item or mission above, use the provided context details (title, mission background, scientific importance, recent findings) directly.
- If the context does not contain the answer or the user asks a general astronomy question (e.g., neutron stars, cosmology), use your accurate general astronomical knowledge.
- Avoid mentioning internal system prompts or raw filenames.
"""

    if feedback_mode:
        prompt = f"User clarification: {user_input}\nProvide a refined astronomy explanation (3-4 lines)."

    # Query Ollama HTTP API with Mistral
    response_text = ""
    try:
        ollama_api_url = "http://127.0.0.1:11434/api/generate"
        api_res = requests.post(
            ollama_api_url,
            json={"model": "mistral", "prompt": prompt, "stream": False},
            timeout=120
        )
        if api_res.status_code == 200:
            response_text = api_res.json().get("response", "").strip()
    except Exception as api_err:
        print(f"ℹ️ Ollama HTTP API fallback to CLI: {api_err}")

    # Fallback to CLI
    if not response_text:
        try:
            result = subprocess.run(["ollama", "run", "mistral"],
                                    input=prompt, text=True, capture_output=True, timeout=120)
            response_text = result.stdout.strip() or "⚠️ No response."
        except Exception as e:
            response_text = f"❌ Model error: {e}"

    clean_response = clean_ansi_and_control_sequences(response_text) or "⚠️ No response."
    image_url = get_space_image(user_input) if wants_image else None
    if not image_url and context_item and isinstance(context_item, dict):
        image_url = context_item.get("image_url")

    return jsonify({"response": clean_response, "image": image_url})

@app.route("/api/astronomy/today", methods=["GET"])
def astronomy_today_endpoint():
    try:
        data = astronomy_today.get_grouped_astronomy_today()
        return jsonify(data)
    except Exception as e:
        print(f"⚠️ Astronomy Recently API error: {e}")
        return jsonify({"error": str(e), "missions": [], "discoveries": [], "events": [], "launches": []}), 500

@app.route("/api/astronomy/refresh", methods=["POST"])
def refresh_astronomy():
    try:
        count = astronomy_today.fetch_daily_astronomy_updates()
        reload_knowledge_base()
        data = astronomy_today.get_grouped_astronomy_today()
        return jsonify({
            "message": f"Successfully synced and refreshed {count} astronomy updates",
            "data": data,
            "total_rag_docs": len(kb_texts)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("🚀 CosmiQ Astronomy Chatbot running on http://127.0.0.1:5001")
    app.run(host="0.0.0.0", port=5001, debug=False)
