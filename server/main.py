import json
import os
from collections.abc import AsyncIterator
from pathlib import Path

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

app = FastAPI()
load_dotenv()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = "groq/compound"
SYSTEM_PROMPT_PATH = Path(__file__).with_name("system_prompt.txt")
SYSTEM_PROMPT = SYSTEM_PROMPT_PATH.read_text(encoding="utf-8").strip()


class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=12000)
    history: list[ChatMessage] = Field(default_factory=list)


@app.get("/")
def home():
    return {"message": "Talkfolio API is running"}


async def groq_stream(request: ChatRequest, api_key: str) -> AsyncIterator[str]:
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        },
        *[message.model_dump() for message in request.history[-20:]],
        {"role": "user", "content": request.message},
    ]

    payload = {
        "model": os.getenv("GROQ_MODEL", DEFAULT_MODEL),
        "messages": messages,
        "stream": True,
        "temperature": 0.7,
    }

    async with httpx.AsyncClient(timeout=None) as client:
        try:
            async with client.stream(
                "POST",
                GROQ_URL,
                headers={"Authorization": f"Bearer {api_key}"},
                json=payload,
            ) as response:
                if response.status_code >= 400:
                    detail = await response.aread()
                    yield f"data: {json.dumps({'error': detail.decode('utf-8', errors='replace')})}\n\n"
                    return

                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    data = line[6:]
                    if data == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data)
                        text = chunk["choices"][0].get("delta", {}).get("content")
                    except (KeyError, IndexError, TypeError, json.JSONDecodeError):
                        continue
                    if text:
                        yield f"data: {json.dumps({'text': text})}\n\n"
        except httpx.HTTPError as error:
            yield f"data: {json.dumps({'error': f'Groq request failed: {error}'})}\n\n"


@app.post("/api/chat")
async def chat(request: ChatRequest):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured")

    return StreamingResponse(
        groq_stream(request, api_key),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
)
