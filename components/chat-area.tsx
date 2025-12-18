"use client"

interface ChatMessage {
  role: "user" | "assistant" | "character_a" | "character_b"
  content: string
}

interface ChatAreaProps {
  chatHistory: ChatMessage[]
  isLoading: boolean
}

export default function ChatArea({ chatHistory, isLoading }: ChatAreaProps) {
  const getCharacterInfo = (role: string) => {
    switch (role) {
      case "character_a":
        return { name: "先生", color: "bg-blue-600 text-white" }
      case "character_b":
        return { name: "生徒", color: "bg-accent text-accent-foreground" }
      default:
        return { name: "?", color: "bg-muted text-muted-foreground" }
    }
  }

  return (
    <div className="h-full bg-card border border-border rounded-lg overflow-hidden flex flex-col">
      {chatHistory.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-xs">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-sm text-foreground font-medium mb-1">会話がここに表示されます</p>
            <p className="text-xs text-muted-foreground">記事を選択して変換ボタンをクリック</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          {chatHistory.map((msg, idx) => {
            const charInfo = getCharacterInfo(msg.role)
            const isCharacterA = msg.role === "character_a"

            return (
              <div key={idx} className={`flex gap-3 ${isCharacterA ? "" : "flex-row-reverse"}`}>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${charInfo.color}`}
                >
                  {charInfo.name.charAt(0)}
                </div>
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <span className={`text-xs text-muted-foreground ${isCharacterA ? "" : "text-right"}`}>
                    {charInfo.name}
                  </span>
                  <div
                    className={`rounded-xl px-4 py-2.5 ${
                      isCharacterA
                        ? "bg-secondary text-secondary-foreground rounded-tl-sm"
                        : "bg-accent/10 text-foreground rounded-tr-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </div>
            )
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <div className="flex gap-0.5">
                  <div
                    className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">処理中...</span>
                <div className="bg-secondary rounded-xl px-4 py-2.5 rounded-tl-sm">
                  <p className="text-sm text-muted-foreground">会話を生成しています（10〜30秒程度かかります）</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
