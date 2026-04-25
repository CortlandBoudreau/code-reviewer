# Code Reviewer AI

An AI-powered code review tool that analyzes your code for security vulnerabilities, performance issues, modernization opportunities, and quality improvements.

Built with FastAPI, React, TypeScript, and the Anthropic Claude API.

![Code Reviewer Screenshot](screenshot.png)

## Features

- 🔍 Paste code or upload a file directly
- 🤖 AI-powered analysis using Claude
- 📊 Visual quality score with colour-coded ring
- 🏷️ Issues categorized by type — security, performance, modernization, quality
- 📋 One-click copy for fix suggestions
- 🕓 Review history saved locally

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui

**Backend:** Python, FastAPI, Anthropic Claude API

## Getting Started

### Prerequisites
- Python 3.13+
- Node.js 24+

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn anthropic python-dotenv
```

Create a `.env` file in the backend folder:
ANTHROPIC_API_KEY=your_api_key_here
ANTHROPIC_MODEL=claude-haiku-4-5
Start the backend:
```bash
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Supported Languages

- PHP
- JavaScript
- TypeScript
- Python
- C#

## License

MIT