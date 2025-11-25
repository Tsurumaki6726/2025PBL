"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import ChatArea from "@/components/chat-area"
import ArticleInput from "@/components/article-input"
import ConvertButton from "@/components/convert-button"

export default function Home() {
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: "user" | "assistant" | "character_a" | "character_b"; content: string }>
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [articleText, setArticleText] = useState("")

  const handleConvert = async () => {
    if (!articleText.trim()) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          article: articleText,
        }),
      })

      if (!response.ok) {
        throw new Error("変換に失敗しました")
      }

      const data = await response.json()

      const newHistory: Array<{ role: "user" | "assistant" | "character_a" | "character_b"; content: string }> = []

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
    setArticleText("")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onReset={handleReset} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header - cleaner, more minimal */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <h1 className="text-xl font-semibold tracking-tight text-foreground">News to Chat</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1 ml-5">Transform articles into conversations</p>
          </div>
        </header>

        {/* Content Area - refined spacing */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Input Area */}
          <div className="flex-1 flex flex-col p-8 border-r border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Input</h2>
              <span className="text-xs text-muted-foreground">{articleText.length.toLocaleString()} chars</span>
            </div>
            <ArticleInput value={articleText} onChange={setArticleText} disabled={isLoading} />
            <div className="mt-6">
              <ConvertButton
                onClick={handleConvert}
                isLoading={isLoading}
                disabled={!articleText.trim() || isLoading}
              />
            </div>
          </div>

          {/* Output Area */}
          <div className="flex-1 flex flex-col p-8 bg-secondary/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Output</h2>
              {chatHistory.length > 0 && (
                <span className="text-xs text-muted-foreground">{chatHistory.length} messages</span>
              )}
            </div>
            <ChatArea chatHistory={chatHistory} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  )
}
