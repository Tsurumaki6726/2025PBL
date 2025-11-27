"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import ChatArea from "@/components/chat-area"
import ArticleSelector from "@/components/article-selector"
import ConvertButton from "@/components/convert-button"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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
  const [isLoadingArticles, setIsLoadingArticles] = useState(false)

  const [apiUrl, setApiUrl] = useState<string>("")
  const [apiUrlInput, setApiUrlInput] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string>("")

  const handleConnect = async () => {
    if (!apiUrlInput.trim()) {
      setConnectionError("URLを入力してください")
      return
    }

    const url = apiUrlInput.trim().replace(/\/$/, "") // Remove trailing slash
    setIsLoadingArticles(true)
    setConnectionError("")

    try {
      const response = await fetch(`${url}/articles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true", // ngrokの警告画面をバイパスするヘッダーを追加
        },
      })

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("text/html")) {
        setConnectionError(
          "ngrokの警告画面が表示されています。ブラウザで一度ngrok URLにアクセスして警告を承認してください。",
        )
        return
      }

      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles)
        setApiUrl(url)
        setIsConnected(true)
        if (data.articles.length > 0) {
          setSelectedArticleId(data.articles[0].id)
        }
      } else {
        setConnectionError(`接続に失敗しました（${response.status}）。URLを確認してください。`)
      }
    } catch (error) {
      console.error("接続エラー:", error)
      setConnectionError("接続に失敗しました。Colabが起動しているか確認してください。")
    } finally {
      setIsLoadingArticles(false)
    }
  }

  const selectedArticle = articles.find((a) => a.id === selectedArticleId)

  const handleConvert = async () => {
    if (selectedArticleId === null || !apiUrl) return

    setIsLoading(true)
    setSummary("")
    setProcessingTime("")

    try {
      const response = await fetch(`${apiUrl}/convert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true", // ngrokの警告画面をバイパスするヘッダーを追加
        },
        body: JSON.stringify({
          article_id: selectedArticleId,
        }),
      })

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("text/html")) {
        throw new Error("ngrokの警告画面が返されました。ブラウザで一度ngrok URLにアクセスして警告を承認してください。")
      }

      if (!response.ok) {
        throw new Error(`変換に失敗しました（${response.status}）`)
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
      setChatHistory([
        {
          role: "assistant",
          content:
            error instanceof Error ? error.message : "エラーが発生しました。Colabが起動しているか確認してください。",
        },
      ])
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

  const handleDisconnect = () => {
    setApiUrl("")
    setIsConnected(false)
    setArticles([])
    setSelectedArticleId(null)
    setChatHistory([])
    setSummary("")
    setProcessingTime("")
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
            {!isConnected ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                    Connect to Google Colab
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Google Colabでバックエンドを起動し、ngrokのURLを入力してください。
                  </p>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://xxxx-xx-xx.ngrok-free.app"
                    value={apiUrlInput}
                    onChange={(e) => setApiUrlInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleConnect} disabled={isLoadingArticles}>
                    {isLoadingArticles ? "接続中..." : "接続"}
                  </Button>
                </div>

                {connectionError && <p className="text-sm text-destructive">{connectionError}</p>}

                <div className="mt-6 p-4 bg-secondary/50 rounded-lg border border-border">
                  <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                    セットアップ手順
                  </h3>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>
                      Google Colabで <code className="bg-secondary px-1 rounded">news_to_chat_colab.py</code> を開く
                    </li>
                    <li>CSVファイルをアップロード（honbun, midasiカラム必須）</li>
                    <li>全てのセルを順番に実行</li>
                    <li>表示されるngrok URLをここに入力</li>
                  </ol>
                </div>
              </div>
            ) : (
              <>
                {/* Connected state */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-muted-foreground">接続中</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleDisconnect}>
                    切断
                  </Button>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Select Article
                  </h2>
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
              </>
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
