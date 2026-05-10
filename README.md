# Translate

A real-time audio-translation playground. The browser captures microphone audio, streams it over a WebSocket to a FastAPI backend, which transcribes it with **Whisper** and translates the text with **deep-translator** (Google Translate), then sends the translated string back.

```
React client  ──audio bytes over WS──▶  FastAPI server
                                            │
                                            ├──▶  OpenAI Whisper  (speech → text)
                                            │
                                            └──▶  deep-translator (text → target lang)
                                            │
   ◀────────── translated text ─────────────┘
```

## Stack

- **`backend/`** — Python · FastAPI · `uvicorn` · `deep-translator` · `openai` (Whisper). WebSocket endpoint at `/ws`; expects each frame as `<json-metadata>\n<audio-bytes>` so the server can route by `type` (`text` / `audio` / `video`).
- **`frontend/`** — React 19 + TypeScript + Vite. Mic capture + WebSocket client.

## Run it

```sh
# Backend (FastAPI on :8000)
cd backend
pip install -r requirements.txt
export OPENAI_API_KEY=...      # required for Whisper transcription
uvicorn main:app --host 0.0.0.0 --reload

# Frontend (Vite on :3000)
cd frontend
npm install
npm run dev
```

Or together:

```sh
./run.sh
```

> The current backend hard-codes an empty `OpenAI(api_key="")` in `main.py` — populate this from `OPENAI_API_KEY` before running. Don't commit a key.

## Status

This is a working prototype, not a finished product. The WebSocket dispatcher is in place, the audio path goes through Whisper → translator, and the React client streams from the mic. The protocol (metadata + binary frame) is intentionally simple so it's easy to swap pieces — e.g., replace Whisper with a local model, or Google Translate with a self-hosted translator.
