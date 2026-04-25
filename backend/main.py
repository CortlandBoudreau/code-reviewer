from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import anthropic
import os
import json

load_dotenv(override=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class ReviewRequest(BaseModel):
    code: str
    language: str

@app.get("/")
def read_root():
    return {"status": "Code Reviewer API is running"}

@app.post("/review")
def review_code(request: ReviewRequest):
    try:
        prompt = f"""You are an expert code reviewer. Analyze the following {request.language} code and return a JSON response only, no markdown, no backticks.

The JSON must follow this exact structure:
{{
  "summary": "brief overall summary of the code quality",
  "score": <number from 0 to 100>,
  "issues": [
    {{
      "type": "security" | "performance" | "modernization" | "quality",
      "title": "short title",
      "description": "detailed explanation and how to fix it"
    }}
  ]
}}

Code to review:
{request.code}"""

        message = client.messages.create(
            model=os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5"),
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )

        raw = message.content[0].text
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1]
        if raw.endswith("```"):
            raw = raw.rsplit("```", 1)[0]
        raw = raw.strip()

        result = json.loads(raw)
        return result

    except Exception as e:
        print(f"ERROR: {str(e)}")
        raise