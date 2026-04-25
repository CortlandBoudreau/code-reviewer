import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"

type HistoryItem = {
  id: string
  fileName: string
  language: string
  score: number
  summary: string
  date: string
}

type Props = {
  history: HistoryItem[]
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export function History({ history, onSelect, onDelete }: Props) {
  if (history.length === 0) return null

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-md border border-input hover:bg-accent cursor-pointer transition-colors"
            onClick={() => onSelect(item.id)}
          >
            <div className="flex items-center gap-3">
              <span className={`text-lg font-bold ${scoreColor(item.score)}`}>
                {item.score}
              </span>
              <div>
                <p className="text-sm font-medium">{item.fileName || "Pasted code"}</p>
                <p className="text-xs text-muted-foreground">{item.language} · {item.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{item.language}</Badge>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(item.id)
                }}
                className="p-1.5 rounded hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}