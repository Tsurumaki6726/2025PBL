"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import ChatArea from "@/components/chat-area"
import ArticleInput from "@/components/article-input"
import ConvertButton from "@/components/convert-button"

export default function Home() {
  const [tone, setTone] = useState<"frank" | "serious" | "educational">("frank")
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
          tone: tone,
        }),
      })

      if (!response.ok) {
        throw new Error("変換に失敗しました")
      }

      const data = await response.json()

      // 記事をチャットに追加
      const newHistory = [
        ...chatHistory,
        { role: "user" as const, content: `記事 (トーン: ${tone}):` },
        { role: "user" as const, content: articleText.slice(0, 100) + "..." },
      ]

      // 会話形式の応答を追加
      if (data.conversation && Array.isArray(data.conversation)) {
        data.conversation.forEach((msg: any) => {
          newHistory.push({
            role: msg.role as "character_a" | "character_b",
            content: msg.content,
          })
        })
      }

      setChatHistory(newHistory)
      setArticleText("")
    } catch (error) {
      console.error("エラー:", error)
      setChatHistory([...chatHistory, { role: "assistant", content: "エラーが発生しました。もう一度試してください。" }])
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
      <Sidebar tone={tone} setTone={setTone} onReset={handleReset} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <div className="border-b border-border bg-card">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-foreground">News to Chat</h1>
            <p className="text-sm text-muted-foreground">ニュース記事を会話形式に変換</p>
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-4 p-6">
          {/* 入力エリア */}
          <div className="flex-1 flex flex-col min-w-0">
            <h2 className="text-lg font-semibold mb-3 text-foreground">記事を入力</h2>
            <ArticleInput value={articleText} onChange={setArticleText} disabled={isLoading} />
          </div>

          {/* ボタン */}
          <div className="flex lg:flex-col justify-center lg:justify-start">
            <ConvertButton onClick={handleConvert} isLoading={isLoading} disabled={!articleText.trim() || isLoading} />
          </div>

          {/* 出力エリア */}
          <div className="flex-1 flex flex-col min-w-0">
            <h2 className="text-lg font-semibold mb-3 text-foreground">会話形式</h2>
            <ChatArea chatHistory={chatHistory} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  )
}
