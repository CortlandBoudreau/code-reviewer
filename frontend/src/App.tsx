import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Copy, Check } from "lucide-react"
import { History } from "@/components/History"
import { ScoreRing } from "@/components/ScoreRing"

type ReviewResult = {
  summary: string
  issues: {
    type: "security" | "performance" | "modernization" | "quality"
    title: string
    description: string
  }[]
  score: number
}

function App() {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("php")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReviewResult | null>(null)
  const [error, setError] = useState("")
  const [fileName, setFileName] = useState("")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  type HistoryItem = {
  id: string
  fileName: string
  language: string
  score: number
  summary: string
  date: string
  result: ReviewResult
  }

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem("review-history")
    return saved ? JSON.parse(saved) : []
  })

  const saveToHistory = (reviewResult: ReviewResult) => {
  const item: HistoryItem = {
    id: Date.now().toString(),
    fileName: fileName || "Pasted code",
    language,
    score: reviewResult.score,
    summary: reviewResult.summary,
    date: new Date().toLocaleDateString(),
    result: reviewResult,
  }
  const updated = [item, ...history].slice(0, 20)
  setHistory(updated)
  localStorage.setItem("review-history", JSON.stringify(updated))
}

  const handleDeleteHistory = (id: string) => {
    const updated = history.filter((h) => h.id !== id)
    setHistory(updated)
    localStorage.setItem("review-history", JSON.stringify(updated))
  }

  const handleSelectHistory = (id: string) => {
    const item = history.find((h) => h.id === id)
    if (item) {
      setResult(item.result)
      setCode("")
      setFileName(item.fileName)
      setLanguage(item.language)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    const ext = file.name.split('.').pop()?.toLowerCase()
    const extToLanguage: Record<string, string> = {
      php: "php",
      js: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      cs: "csharp",
    }

    if (ext && extToLanguage[ext]) {
      setLanguage(extToLanguage[ext])
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setCode(event.target?.result as string)
    }
    reader.readAsText(file)
  }

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const badgeColor = {
    security: "destructive",
    performance: "secondary",
    modernization: "outline",
    quality: "default",
  } as const

  const handleReview = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError("")
    setResult(null)

    try {
      console.log("Token:", import.meta.env.VITE_API_SECRET_TOKEN)
      const response = await fetch("http://127.0.0.1:8000/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_API_SECRET_TOKEN}`
        },
        body: JSON.stringify({ code, language }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(`API error ${response.status}: ${data.detail || JSON.stringify(data)}`)
        return
      }
      setResult(data)
      saveToHistory(data)

    } catch (err) {
      setError(`Failed to connect to the API: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        <History
          history={history}
          onSelect={handleSelectHistory}
          onDelete={handleDeleteHistory}
        />

        <div>
          <h1 className="text-3xl font-bold">Code Reviewer</h1>
          <p className="text-muted-foreground mt-1">Paste your code and get instant AI-powered feedback</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="flex items-center gap-3">
              <Select value={language} onValueChange={(value) => value && setLanguage(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="php">PHP</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="csharp">C#</SelectItem>
                </SelectContent>
              </Select>

              <label
                htmlFor="file-upload"
                className="cursor-pointer text-sm px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Upload File
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".php,.js,.ts,.tsx,.py,.cs"
                className="hidden"
                onChange={handleFileUpload}
              />
              {fileName && (
                <span className="text-sm text-muted-foreground">{fileName}</span>
              )}
            </div>

            <Textarea
              placeholder="Paste your code here..."
              className="font-mono text-sm min-h-64"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <Button onClick={handleReview} disabled={loading || !code.trim()} className="w-full">
              {loading ? "Analysing..." : "Review Code"}
            </Button>

            {error && <p className="text-destructive text-sm">{error}</p>}
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Review Summary
                  <ScoreRing score={result.score} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{result.summary}</p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {result.issues.map((issue, i) => (
                <Card key={i}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Badge variant={badgeColor[issue.type]}>{issue.type}</Badge>
                        <div>
                          <p className="font-medium">{issue.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopy(issue.description, i)}
                        className="shrink-0 p-1.5 rounded hover:bg-accent transition-colors"
                        title="Copy suggestion"
                      >
                        {copiedIndex === i
                          ? <Check className="w-4 h-4 text-green-500" />
                          : <Copy className="w-4 h-4 text-muted-foreground" />
                        }
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default App