"use client"

import { ChevronDown } from "lucide-react"

interface Article {
  id: number
  preview: string
  content: string
}

interface ArticleSelectorProps {
  articles: Article[]
  selectedId: number | null
  onSelect: (id: number) => void
  disabled: boolean
  isLoading: boolean
}

export default function ArticleSelector({ articles, selectedId, onSelect, disabled, isLoading }: ArticleSelectorProps) {
  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center bg-card border border-border rounded-lg">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">記事を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-card border border-border rounded-lg">
        <div className="text-center p-8">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-sm text-foreground font-medium mb-1">記事が見つかりません</p>
          <p className="text-xs text-muted-foreground">CSVファイルを確認してください</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Dropdown selector */}
      <div className="relative">
        <select
          value={selectedId ?? ""}
          onChange={(e) => onSelect(Number(e.target.value))}
          disabled={disabled}
          className="w-full appearance-none bg-card border border-border rounded-lg px-4 py-3 pr-10 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {articles.map((article) => (
            <option key={article.id} value={article.id}>
              {article.id}. {article.preview.length > 40 ? article.preview.slice(0, 40) + "..." : article.preview}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>

      <div className="max-h-48 overflow-y-auto bg-card border border-border rounded-lg">
        <div className="divide-y divide-border">
          {articles.map((article) => (
            <button
              key={article.id}
              onClick={() => onSelect(article.id)}
              disabled={disabled}
              className={`w-full text-left px-4 py-3 transition-colors hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedId === article.id ? "bg-accent/10 border-l-2 border-l-accent" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary text-xs font-medium flex items-center justify-center text-muted-foreground">
                  {article.id}
                </span>
                <span className="text-sm text-foreground line-clamp-1">{article.preview}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
