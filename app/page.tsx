"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/sidebar"
import ChatArea from "@/components/chat-area"
import ArticleSelector from "@/components/article-selector"
import ConvertButton from "@/components/convert-button"

interface Article {
  id: number
  preview: string
  content: string
}

export default function Home() {
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: "user" | "assistant" | "character_a" | "character_b"; content: string }>
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null)
  const [summary, setSummary] = useState<string>("")
  const [processingTime, setProcessingTime] = useState<string>("")
  const [isLoadingArticles, setIsLoadingArticles] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/articles")
        if (response.ok) {
          const data = await response.json()
          setArticles(data.articles)
          if (data.articles.length > 0) {
            setSelectedArticleId(data.articles[0].id)
          }
        }
      } catch (error) {
        console.error("記事の取得に失敗しました:", error)
      } finally {
        setIsLoadingArticles(false)
      }
    }
    fetchArticles()
  }, [])

  const selectedArticle = articles.find((a) => a.id === selectedArticleId)

  const handleConvert = async () => {
    if (selectedArticleId === null) return

    setIsLoading(true)
    setSummary("")
    setProcessingTime("")

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          article_id: selectedArticleId,
        }),
      })

      if (!response.ok) {
        throw new Error("変換に失敗しました")
      }

      const data = await response.json()

      if (data.summary) {
        setSummary(data.summary)
      }
      if (data.processing_time) {
        setProcessingTime(data.processing_time)
      }

      const newHistory: Array<{ role: "character_a" | "character_b"; content: string }> = []

      if (data.conversation && Array.isArray(data.conversation)) {
        data.conversation.forEach((msg: { role: string; content: string }) => {
          newHistory.push({
            role: msg.role as "character_a" | "character_b",
            content: msg.content,
          })
        })
      }

      setChatHistory(newHistory)
    } catch (error) {
      console.error("エラー:", error)
      setChatHistory([{ role: "assistant", content: "エラーが発生しました。もう一度お試しください。" }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setChatHistory([])
    setSummary("")
    setProcessingTime("")
    if (articles.length > 0) {
      setSelectedArticleId(articles[0].id)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onReset={handleReset} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <h1 className="text-xl font-semibold tracking-tight text-foreground">News to Chat</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1 ml-5">Transform articles into conversations</p>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Input Area */}
          <div className="flex-1 flex flex-col p-8 border-r border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Select Article</h2>
              <span className="text-xs text-muted-foreground">{articles.length} articles</span>
            </div>

            <ArticleSelector
              articles={articles}
              selectedId={selectedArticleId}
              onSelect={setSelectedArticleId}
              disabled={isLoading}
              isLoading={isLoadingArticles}
            />

            <div className="mt-6">
              <ConvertButton
                onClick={handleConvert}
                isLoading={isLoading}
                disabled={selectedArticleId === null || isLoading}
              />
            </div>

            {selectedArticle && (
              <div className="mt-6 p-4 bg-secondary/50 rounded-lg border border-border">
                <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                  Selected Article Preview
                </h3>
                <p className="text-sm text-foreground leading-relaxed line-clamp-6">{selectedArticle.content}</p>
              </div>
            )}
          </div>

          {/* Output Area */}
          <div className="flex-1 flex flex-col p-8 bg-secondary/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Output</h2>
              {processingTime && <span className="text-xs text-accent font-medium">{processingTime}</span>}
            </div>

            {summary && (
              <div className="mb-4 p-4 bg-card border border-border rounded-lg">
                <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">Summary</h3>
                <p className="text-sm text-foreground leading-relaxed">{summary}</p>
              </div>
            )}

            <ChatArea chatHistory={chatHistory} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  )
}
