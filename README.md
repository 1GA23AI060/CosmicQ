# CosmiQ — AI Astronomy & Deep Space Knowledge

CosmiQ is an astronomy-focused AI chatbot that combines deep space scientific knowledge, Ollama Mistral inference, similarity search over astrophysics research papers, and a modern Figma-designed futuristic user interface.

## Application Architecture

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS (`ContinueDevelopment-main/ContinueDevelopment-main`)
  - **Landing Page:** Interactive cosmic visualization, astronomy category cards, and responsive navigation.
  - **Login Page:** Clean astronaut portal authentication screen.
  - **Chatbot Interface:** Minimalist ChatGPT-style astronomy interface with space image generation/search, conversation history, new chat management, share links, and query refinement feedback.
- **Backend:** Flask API (`app.py`) on port `5001`
  - SentenceTransformer embeddings & FAISS similarity search across astrophysics papers.
  - Local Ollama Mistral integration for astronomy responses.
  - Image search via SerpApi / NASA / Deep space imagery integration.

## Getting Started

### 1. Start Backend (Terminal 1)
```bash
python app.py
```
Backend runs on `http://127.0.0.1:5001`.

### 2. Start Frontend (Terminal 2)
```bash
npm run dev
# or
pnpm dev
```
Frontend runs on `http://localhost:5173`.
