import os
import pandas as pd
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

load_dotenv()

df = pd.read_csv("data/astronomy_papers.csv")
print(f"📄 Loaded {len(df)} papers")

texts = df["abstract"].fillna("").tolist()
metadatas = df[["id", "title", "url", "year"]].to_dict(orient="records")

print("🧠 Loading local embedding model (all-MiniLM-L6-v2)...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

print("🔧 Creating embeddings and building FAISS index (offline)...")
db = FAISS.from_texts(texts, embedding=embeddings, metadatas=metadatas)

db.save_local("faiss_index")
print("✅ FAISS index created successfully and saved to 'faiss_index/' folder!")





