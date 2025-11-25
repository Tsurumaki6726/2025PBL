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
        return { name: "A", color: "bg-accent text-accent-foreground" }
      case "character_b":
        return { name: "B", color: "bg-primary text-primary-foreground" }
      default:
        return { name: "?", color: "bg-muted text-muted-foreground" }
    }
  }

  return (
    <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
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
            <p className="text-xs text-muted-foreground">左側に記事を入力して変換ボタンをクリック</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {chatHistory.map((msg, idx) => {
            const charInfo = getCharacterInfo(msg.role)
            const isCharacterA = msg.role === "character_a"

            return (
              <div key={idx} className={`flex gap-3 ${isCharacterA ? "" : "flex-row-reverse"}`}>
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${charInfo.color}`}
                >
                  {charInfo.name}
                </div>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                    isCharacterA
                      ? "bg-secondary text-secondary-foreground rounded-tl-sm"
                      : "bg-accent/10 text-foreground rounded-tr-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            )
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}
